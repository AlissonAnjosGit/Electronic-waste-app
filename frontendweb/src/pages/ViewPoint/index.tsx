import React, {useEffect, useState, ChangeEvent} from 'react';
import {FiSearch, FiPlus, FiArrowLeft} from 'react-icons/fi';
import {Link, useHistory} from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './styles.css';
import axios from 'axios';
import api from '../../services/api';

interface Point {
    ponto:{
        image: string,
        image_url:string,
        name:string,
        email:string,
        whatsapp:string,
        rua: string,
        numero: string,
        city: string,
        uf: string
    },
    categorias:{
        title:string
    }[]
}

interface IBGEUFResponse {
    sigla:string,
    id: number
}

interface IBGECityResponse {
    nome:string
}

const ViewlPoint = ()=>{
    const history = useHistory();
    let pointId = localStorage.getItem("pointId");
    const [point, setPoint] = useState<Point>({} as Point);
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cities, setCities] = useState<IBGECityResponse[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');

    const [selectedCity, setSelectedCity] = useState('0');


    function handleSelectedUF(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;

        for(let i = 0; i < ufs.length; i ++ ) {
            if(ufs[i].sigla === uf){
                localStorage.setItem("ufId", JSON.stringify(ufs[i].id))
                break;
            }
        }
        localStorage.setItem("uf", uf)
        setSelectedUF(uf);

    }

    function handleSelectedCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        localStorage.setItem("city", city)
        setSelectedCity(city);
    }

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

    function handleSubmit(){
        history.push('points-map');
    }

    useEffect( ()=>{ //carrega os pontos filtrados
        api.get(`pontos/${pointId}`).then(response =>{
            setPoint(response.data);
            console.log(response.data)    
        })

    },[]);

    if(!point.ponto){ // serve como loading enquanto nao carrega o ponto
        return null;
    }


    return(
        <div id="view-point">
            <div className="content">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/points-map">
                    <FiArrowLeft/>
                    Voltar  
                </Link>
            </header>

                <main>
                    <br />
                    <br />
                    <form onSubmit={handleSubmit}>
                        <div className="field-group">
                            <div className="field">

                                <img src={point.ponto.image_url} alt="" 
                                     height = "400" width = "400"
                                />

                            </div>
                            <div className="field">
                                <h1>{point.ponto.name}</h1>

                                <fieldset>
                                    <legend>
                                    <h2>Endereço</h2>
                                    </legend>
                                    <div className="field-group">
                                        <div className="field">
                                            <label htmlFor="email">Email</label>
                                            <h4>{point.ponto.email}</h4>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="whatsapp">Telefone</label>
                                            <h4>{point.ponto.whatsapp}</h4>
                                        </div>

                                    </div>
                                    <div className = "field-group">
                                        <div className="field">
                                            <label htmlFor="rua">Rua/Avenida</label>
                                            <h4>{point.ponto.rua}</h4>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="numero">Número</label>
                                            <h4>{point.ponto.numero}</h4>                                   
                                        </div>
                                    </div>
                                    <div className="field-group">
                                    <div className="field">
                                            <label htmlFor="numero">Estado</label>
                                            <h4>{point.ponto.uf}</h4>                                   
                                        </div>
                                        <div className="field">
                                            <label htmlFor="numero">Cidade</label>
                                            <h4>{point.ponto.city}</h4>                                   
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset>
                                    <legend>
                                        <h2>Categorias</h2> 
                                    </legend>
                                    <ul >
                                        {point.categorias.map( item => (
                                            <li 
                                                key={item.title} 
                                            >
                                                <span>{item.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </fieldset>
                            </div>
                        </div>
                       
                    </form>

                </main>

            </div>
        </div>
    );
}

export default ViewlPoint;