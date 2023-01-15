import React from 'react';
import {FiSearch, FiPlus} from 'react-icons/fi';
import {Link} from 'react-router-dom';
import logo from '../../assets/logo.svg';
import './styles.css';

const Home = ()=>{

    return(
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Logo"/>
                </header>

                <main>
                    <h1>Saiba onde descartar seu lixo eletrônico!</h1>
                    <p>Encontre pontos de coleta em sua cidade ou cadastre um novo ponto</p>

                    <Link to="/create-point">
                        <span>
                           <FiPlus/>
                        </span>
                        <strong>Cadastrar um ponto de coleta</strong>
                    </Link>

                    <Link to="/search-points">
                        <span>
                           <FiSearch/>
                        </span>
                        <strong>Encontrar pontos de coleta</strong>
                    </Link>
                </main>

            </div>
        </div>
    );
}

export default Home;