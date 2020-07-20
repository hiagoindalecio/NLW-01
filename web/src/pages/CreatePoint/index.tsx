import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'; //Importando icone FiArrowLeft da lib react-icons/fi
import { Map, TileLayer, Marker } from 'react-leaflet'; // Map-> mapa/TileLayer-> Layout/Marker-> Alfinete
import { LeafletMouseEvent } from 'leaflet'; // Importando o evendo de click com o mouse do leaflet

import api from '../../services/api';
import axios from 'axios';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

const CreatePoint = () => {
    interface Item {
        id_item: number;
        title: string;
        imagem_url: string;
    }
    interface IBGEUF {
        nome: string;
        sigla: string;
    }
    interface IBGECity {
        nome: string;
    }
    const [items, setItems] = useState<Item[]>([/*valor inicial*/]); // Array do tipo Item
    const [ufs, setUfs] = useState<string[]>([]); // Array de string
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedfile] = useState<File>();
    const history = useHistory(); // carregando a variavel history com a lib importada do react-router-dom
    
    useEffect(() => { // carrega quando a pagina abre
        api.get('items').then(response => {
            setItems(response.data); // response eh o objeto retornada onde em data se encontra o arry
        });
    }, []);
    useEffect(() => { // carrega quando a pagina abre
        axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => String(uf.nome + " - " + uf.sigla));
            setUfs(ufInitials); // Carregando o array de UF com o resultado da API
        });
    }, []);
    useEffect(() => { // carrega quando o estado selectedUF eh alterado de acordo com [selecteUF]
        if (selectedUF === '0') {
            setCities(["Selecione uma cidade"]);
            return;
        }
        axios.get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cities = response.data.map(city => city.nome);
            setCities(cities);
        })
    }, [selectedUF])
    useEffect(() =>{ // carrega quando a pagina abre
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords; //pega latitude e longitude de dentro de position.coords
            setInitialPosition([latitude, longitude]);
        });
    }, [])
    // esta função tem o papel de carregar o UF selecionado no estado selectedUF
    function handleSelectedUF(event: ChangeEvent<HTMLSelectElement>) { // setando o parametro como um evento de mudança em um elemento select de HTML
        const selected = event.target.value
            .split('-')
            .map(item => String(item.trim()));
            setSelectedUF(String(selected[1]));
    }
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) { // setando o parametro como um evento de mudança em um elemento select de HTML
        const selected = event.target.value;
            setSelectedCity(selected);
    }
    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target; // pegando name e value de dentro de event.target(retorno do evento)
        setFormData({ ...formData, [name]: value }); //...formData copia todos os dados que ja estao presentes em formData para que nao se percam e a propriedade com o mesmo valor de name ira receber value
    }
    function handleSelectedItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item ===id); // verifica se tem algum item com o valor igual a id e retorna o indice ou -1
        if (alreadySelected >= 0 ) {
            const filteredItens = selectedItems.filter(item => item !== id); // retorna todos os indeces diferentes de id
            setSelectedItems(filteredItens);
        } else {
            setSelectedItems([ ...selectedItems, id ]); // sobreppoe os itens selecionados com os itens que ja estavam no estado e mais o item atual
        }
    }
    async function handleSubmit(event: FormEvent) { // recebe um evento para nao recarregar outra pagina ao dar submit (funcao padrao do javascript)
        event.preventDefault(); //funcao que bloqueia o recarregamento da pagina
        const { name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition; // pega os valores de latitude e de longitude de dentro do array
        const items = selectedItems;
        if(name === '' || email === '' || whatsapp === '' || uf === '0' || city === '0' || uf === 'Selecione uma UF' || city === 'Selecione uma cidade' || latitude === 0 || longitude === 0 || items === [] || selectedFile === undefined) {
            alert('Por favor preencha todos os campos para salvar um novo ponto de coleta!');
        } else {
            /*const data = { // jogando todos os dados em data
                name,
                email,
                whatsapp,
                uf,
                city,
                latitude,
                longitude,
                items
            }*/
            const data = new FormData();
            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('uf', uf);
            data.append('city', city);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('items', items.join(','));
            if (selectedFile) {
                data.append('image', selectedFile);
            }
            await api.post('points', data); // await diz para que a funcao aguarde o comando finalizar para prosseguir, uma vez que a funcao foi estabelecida como async
            alert('Novo ponto de coleta criado!');
            history.push('/'); // redirecionando o user para '/'
        }
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedfile} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>
                            Selecione o endereço no mapa
                        </span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} zoom={15} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" onChange={handleSelectedUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => ( // percorre items retornando algo a cada [indice]
                            <li key={item.id_item} 
                            onClick={() => handleSelectedItem(item.id_item)}
                            className={selectedItems.includes(item.id_item)/*retorna true ou false se tiver no array*/ ? 'selected' : ''}
                            >
                                <img src={item.imagem_url} alt={item.imagem_url} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;