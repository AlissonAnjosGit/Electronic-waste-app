import React, {useEffect, useState, ChangeEvent} from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft, FiInfo} from 'react-icons/fi';
import {MapContainer, TileLayer, Marker, useMapEvents, Tooltip} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent, map, marker } from 'leaflet';

//estado para array ou objeto manualmente informar o tipo da variavel

interface Item {
    id: number,
    name: string,
    image_url: string
}

interface Point {
    id: number,
    name: string,
    latitude: number,
    longitude: number
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}


const PointsMap = ()=> {
    const history = useHistory();
    let descricao1 = "Grandes equipamentos: geladeiras, freezers, máquinas de lavar, fogões, ar condicionados, microondas, grandes TVs, etc" 
    let descricao2 = "Pequenos equipamentos e eletroportáteis: torradeiras, batedeiras, aspiradores de pó, ventiladores, mixers, secadores de cabelo, ferramentas elétricas, calculadoras, câmeras digitais, rádios, etc."
    let descricao3 = "Equipamentos de informática e telefonia: computadores, tablets, notebooks, celulares, impressoras, monitores e outros."
    let descricao4 = "Pilhas e baterias portáteis: pilhas modelos AA, AAA, recarregáveis, baterias portáteis de 9 V, etc."
    let city = localStorage.getItem("city");
    let uf = localStorage.getItem("uf");
    let ufId = localStorage.getItem("ufId");
    let lat = 0;
    let long = 0;
    const municipios = require('../../mocks/municipios.json');
    
    for(let i = 0; i < municipios.length; i ++ ) {
        if(String(municipios[i].codigo_uf) === ufId && municipios[i].nome === city){
            lat = municipios[i].latitude ;
            long = municipios[i].longitude;
            console.log(municipios[i].latitude, municipios[i].longitude)
            break;
        }
    }

    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cities, setCities] = useState<IBGECityResponse[]>([]);
    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:''
    });

    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([])
 

    useEffect( ()=>{ //recebe os items do servidor
        api.get('categorias').then(response =>{
            setItems(response.data);
        })
    },[]);

    useEffect( ()=>{ //carrega os pontos filtrados
        api.get('pontos', {
            params:{
                city: city,
                uf: uf,
                categorias: selectedItems
            }
        }).then(response =>{
            setPoints(response.data);
            console.log(points)
        })
 

    },[selectedItems]);

    useEffect( ()=>{ //recebe os estados
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            setUfs(response.data);
        })
    },[]);

    useEffect( ()=>{ // recebe as cidades
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response =>{
            setCities(response.data);
        })
    },[selectedUF]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
          //  console.log(latitude,longitude)
            setInitialPosition([latitude, longitude]);

        });
    }, []);


    function handleMarkerClick(){
        history.push("/view-point")
    }

    function handleSelectedItem(id:number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >=0 ){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else{
            setSelectedItems([... selectedItems,id]);
        }


    }



    const Markers = () => {

        const map = useMapEvents({
           
        })
        map.setView([lat,long], 12);

       
        return (
            selectedPosition ? 
                <Marker            
                key={selectedPosition[0]}
                position={selectedPosition}
                interactive={false} 
                />
            : null
        )   
        
    }

    return(
        <div id="points-map">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/search-points">
                    <FiArrowLeft/>
                    Voltar  
                </Link>
            </header> 
            <form >
                <div className="icon">
                    <h2><FiInfo/> Selecione o(s) tipo(s) de lixo eletrônico que deseja descartar: </h2>
                    <div className="description">
                        <ul>
                            <li>{descricao1}</li>
                            <li>{descricao2}</li>
                            <li>{descricao3}</li>
                            <li>{descricao4}</li>
                        </ul>
                    </div>
                </div>
    
                <fieldset>
                    <ul className="items-grid">
                        {items.map( item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected': ''}
                            >
                                <img src={item.image_url} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>{`Pontos de coleta em ${city} que recebem os tipos selecionados:`}</h2>
             
                    </legend>
                    <MapContainer >
                    <Markers/> 
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {points.map( point => (
                        <Marker 
                        key = {point.id}
                        position = {[point.latitude,point.longitude]} 
                        eventHandlers={{
                            click: () => {
                            localStorage.setItem("pointId", JSON.stringify(point.id))
                            console.log(point.id)
                            handleMarkerClick();
                            },
                        }}
                        >
                            <Tooltip>{point.name}</Tooltip> 
                        </Marker>
                    ))}

                    </MapContainer>

                </fieldset>
                <h4>Clique no ponto para obter mais informações</h4>
            </form>
        </div>
    );
}

export default PointsMap;