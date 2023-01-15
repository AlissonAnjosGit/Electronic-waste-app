import {Route, BrowserRouter} from 'react-router-dom';
import React from 'react';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import SearchPoints from './pages/SearchPoints';
import PointsMap from './pages/PointsMap';
import ViewlPoint from './pages/ViewPoint';

const Routes = ()=>{
    return(
        <BrowserRouter>
             <Route component={Home} path="/" exact/>
             <Route component={CreatePoint} path="/create-point"/>
             <Route component={SearchPoints} path="/search-points"/>
             <Route component={PointsMap} path="/points-map"/>
             <Route component={ViewlPoint} path="/view-point"/>
         </BrowserRouter>
    );

}

export default Routes;