import React, {useEffect, useState, ChangeEvent} from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft, FiInfo} from 'react-icons/fi';
import {MapContainer, TileLayer, Marker, useMapEvents} from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../components/Dropzone'

//estado para array ou objeto manualmente informar o tipo da variavel

interface Item {
    id: number,
    name:string,
    image_url:string
}

interface IBGEUFResponse {
    sigla:string,
    id:number
}

interface IBGECityResponse {
    nome:string
}


const CreatePoint = ()=> {
    
    const history = useHistory();

    let descricao1 = "Grandes equipamentos: geladeiras, freezers, máquinas de lavar, fogões, ar condicionados, microondas, grandes TVs, etc" 
    let descricao2 = "Pequenos equipamentos e eletroportáteis: torradeiras, batedeiras, aspiradores de pó, ventiladores, mixers, secadores de cabelo, ferramentas elétricas, calculadoras, câmeras digitais, rádios, etc."
    let descricao3 = "Equipamentos de informática e telefonia: computadores, tablets, notebooks, celulares, impressoras, monitores e outros."
    let descricao4 = "Pilhas e baterias portáteis: pilhas modelos AA, AAA, recarregáveis, baterias portáteis de 9 V, etc."

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cities, setCities] = useState<IBGECityResponse[]>([]);
    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:'',
        rua:'',
        numero:''
    });
    
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();
    

    let lat = 0;
    let long = 0;

    useEffect( ()=>{ //recebe os items do servidor
        api.get('categorias').then(response =>{
            setItems(response.data);
            console.log(response.data)
        })
    },[]);

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

    function handleSelectedUF(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        for(let i = 0; i < ufs.length; i ++ ) {
            if(ufs[i].sigla == uf){
                localStorage.setItem("ufId2", JSON.stringify(ufs[i].id))
                break;
            }
        }
        setSelectedUF(uf);
    }

    function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        localStorage.setItem("city2", city)
        setSelectedCity(city);

        let city2 = localStorage.getItem("city2");
        let ufId2 = localStorage.getItem("ufId2");

        const municipios = require('../../mocks/municipios.json');
        for(let i = 0; i < municipios.length; i ++ ) {
            if(String(municipios[i].codigo_uf) === ufId2 && municipios[i].nome === city2){
                lat = municipios[i].latitude ;
                long = municipios[i].longitude;
                setInitialPosition([lat, long]);
                break;
            }
        }
    }

    function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setFormData({...formData, [name]:value})
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

    function handleSubmit(){

        if(selectedPosition.values().next().value === 0 && selectedPosition.values().next().value === 0){
            alert('Clique no endereço do ponto no mapa!');
        }
        else if(selectedItems.length === 0){
            alert('Selecione no mínimo uma categoria!');
        }

        else if(!selectedFile){
            alert('Adicione uma imagem!');
        }
        else{
            const {name, email, whatsapp, rua, numero} = formData;
            const uf = selectedUF;
            const city = selectedCity;
            const categorias = selectedItems;
            const [latitude, longitude] = selectedPosition;
    
    
            const data =  new FormData();
            data.append('name',name);
            data.append('email',email);
            data.append('whatsapp',whatsapp);
            data.append('rua',rua);
            data.append('numero',numero);
            data.append('uf',uf);
            data.append('city',city);
            data.append('latitude',String(latitude));
            data.append('longitude',String(longitude));
            data.append('categorias',categorias.join(','));

            if(selectedFile){
                data.append('image',selectedFile);
            }

    
            console.log(data)
            api.post('pontos', data);
            alert('Ponto de Coleta criado!');
            history.push('/');
        }
    }

    const Markers = () => {

        const map = useMapEvents({
            click(e) {                              
                setSelectedPosition([
                    e.latlng.lat,
                    e.latlng.lng
                ]); 
                        
            },            
        })
        map.setView(initialPosition, 13)
    
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
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para pagina inicial  
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>
                <Dropzone onFileUploaded = {setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input 
                        type="text"
                        name="name"
                        id="name"
                        required = {true}
                        onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input 
                            type="email"
                            name="email"
                            id="email"
                            required = {true}
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Telefone</label>
                            <input 
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            required = {true}
                            onChange={handleInputChange}
                            />
                        </div>
 
                    </div>

                </fieldset>

                <fieldset>
                <div className = "field-group">
                        <div className="field">
                            <label htmlFor="rua">Rua/Avenida</label>
                            <input 
                            type="text"
                            name="rua"
                            id="rua"
                            required = {true}
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="numero">Número</label>
                            <input 
                            type="text"
                            name="numero"
                            id="numero"
                            required = {true}
                            onChange={handleInputChange}
                            />
                        </div>
                </div>
                <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} required = {true} onChange={handleSelectedUF}>
                                <option value="">Selecione um Estado</option>
                                {ufs.map( uf => (
                                    <option id="ufSel" value={uf.sigla} key={uf.sigla} >{uf.sigla}</option>   
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} required = {true} onChange={handleSelectedCity}>
                                <option value="">Selecione uma Cidade</option>
                                {cities.map( city => (
                                    <option id="ufSel" value={city.nome} key={city.nome} >{city.nome}</option>   
                                ))}
                               
                            </select>
                        </div>
                    </div>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione a UF, depois a cidade.</span>
                    </legend>
                    <MapContainer >
                    <Markers/> 
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    </MapContainer>
                    <h3>Marque o endereço do ponto no mapa</h3>

                </fieldset>

                <fieldset>
                    <legend>
                    <div className="icon">
                        <h2><FiInfo/> Categorias </h2>
                        <div className="description"> 
                            <ul>
                                <li>{descricao1}</li>
                                <li>{descricao2}</li>
                                <li>{descricao3}</li>
                                <li>{descricao4}</li>
                            </ul>
                        </div>
                     </div>
                        <span>Clique no(s) tipo(s) de lixo que seu ponto recebe </span>
                    </legend>
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
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
}

export default CreatePoint;