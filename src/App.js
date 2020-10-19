import React, { useEffect, useState } from 'react';
import './App.css';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InfoBox from './component/InfoBox'
import Table from './component/Table'
import Map from './component/Map'
import LineGraph from './component/LineGraph'
import { Card,CardContent } from '@material-ui/core';
import { prettyPrintStat, sortData } from './util';
import "leaflet/dist/leaflet.css";

function App() {
  const [ countries,setCountries ]= useState(["Worldwide","USA","UK","India"]);
  const [ country, setCountry ] = useState('Worldwide');
  const [ countryInfo, setCountryInfo ] = useState({});
  const [ tableData, setTableData ] = useState([]);
  const [ mapCenter, setMapCenter ] = useState({ lat: 20.5937, lng: 78.9629 }); 
  //center of pac ocean ({ lat: 34.80746, lng: -40.4796 });
  const [ mapZoom, setMapZoom ] = useState(3)
  const [ mapCountries, setMapCountries ] = useState([])
  const [ casesType, setCasesType ] = useState('cases')

  useEffect( ()=>{

   const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then(response => response.json())
      .then(data => {
        const countries = data.map( country =>(
          {
            name : country.country,
            value : country.countryInfo.iso2
          }));

          const sortedData = sortData(data)
          setTableData(sortedData);
          setCountries(countries)
          setMapCountries( data );
      });
    };

      getCountriesData();
  }, [] );

  useEffect( async () =>
  {
    await fetch("https://disease.sh/v3/covid-19/all")
    .then( response => response.json())
    .then( data =>{
        setCountryInfo(data);
    } )
  },[]);
    
  const onCountryChnage = async (event) =>
  {
    const countryCode = event.target.value;
    // for worldwide option we need to have another URL
    const url =
        countryCode === 'Worldwide' ?
         "https://disease.sh/v3/covid-19/all"     :
         `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then( response => response.json() )
    .then( data => {
      setCountry(countryCode);
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  }


  return (
    <div className="app">
      <div className = "app__left">
        <div className="app__header">
          <h1>Covid 19 tracker application</h1>
          <FormControl className="app__dropdown"> {/*BEM naming convention*/}
            <Select variant="outlined" value={country} onChange = {onCountryChnage}>

              <MenuItem value="Worldwide">Worldwide</MenuItem>

              { countries
                .map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
            <InfoBox onClick ={ e => setCasesType('cases') } title="Coronavirus Cases"
                      isRed 
                      active = { casesType==='cases'}
                      cases={prettyPrintStat(countryInfo.todayCases)} 
                      total={prettyPrintStat(countryInfo.cases)}/>
            <InfoBox onClick ={ e => setCasesType('recovered') } title="Recoverd"
                      active = { casesType==='recovered'}
                      cases={prettyPrintStat(countryInfo.todayRecovered)}
                      total={prettyPrintStat(countryInfo.recovered)}/>
            <InfoBox onClick ={ e => setCasesType('deaths') } title="Deaths" 
                      isRed 
                      active = { casesType==='deaths'}
                      cases={prettyPrintStat(countryInfo.todayDeaths)} 
                      total={prettyPrintStat(countryInfo.deaths)}/>
        </div>

        {/* Map */}
        <Map casesType = {casesType} countries = { mapCountries} center ={ mapCenter } zoom ={ mapZoom }/>
      </div>
      
      <Card className = "app__right">
       <CardContent>
       {/* <div className="app__information"> */}
          <h3 className="app__rightTitle">Live cases by country</h3>
          {/* Table */}
          <Table countries={tableData}/>
          {/* chart */}
          <h3 className="app__graphTitle">Worldwide new { casesType }</h3>
          <LineGraph className = "app__graph" casesType={ casesType }/>
          {/* </div> */}
       </CardContent >
      </Card>
    </div>
  );
}

export default App;
