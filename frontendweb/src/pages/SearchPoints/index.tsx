import React, {useEffect, useState, ChangeEvent} from 'react';
import {FiSearch, FiPlus, FiArrowLeft} from 'react-icons/fi';
import {Link, useHistory} from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './styles.css';
import axios from 'axios';
import api from '../../services/api';

interface IBGEUFResponse {
    sigla:string,
    id: number
}

interface IBGECityResponse {
    nome:string
}



const SearchPoints = ()=>{
    const history = useHistory();
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cities, setCities] = useState<IBGECityResponse[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');


    function handleSelectedUF(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;

        for(let i = 0; i < ufs.length; i ++ ) {
            if(ufs[i].sigla == uf){
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

    


    return(
        <div id="search-points">
            <div className="content">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para pagina inicial  
                </Link>
            </header>

                <main>
                    <h1>Encontrar pontos</h1>
                    <p>Selecione primeiro o estado e depois a cidades serão disponibilizadas</p>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit">Pesquisar</button>
                    </form>

                </main>

            </div>
        </div>
    );
}

export default SearchPoints;