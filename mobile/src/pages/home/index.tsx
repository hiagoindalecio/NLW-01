import React, { useState, useEffect, ChangeEvent } from 'react';
import { View, ImageBackground, Text, Image, StyleSheet } from 'react-native'; // ImageBackground é uma View que aceita uma imagem de background
import { RectButton } from 'react-native-gesture-handler'; // botao retangular estilizado
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

const Home = () => {
    interface IBGEUF {
        nome: string;
        sigla: string;
    }
    interface IBGECity {
        nome: string;
    }
    interface SelectItem {
      label: string;
      value: string;
    }
    const navigation = useNavigation();
    const [ufs, setUfs] = useState<SelectItem[]>([]);
    const [cities, setCities] = useState<SelectItem[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    useEffect(() => {
      axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
              const ufInitials = response.data.map(function(uf){
                return {
                  label: uf.nome,
                  value: uf.sigla
                }
              });
            setUfs(ufInitials); // Carregando o array de UF com o resultado da API
        });
    },[]);
    useEffect(() => { // carrega quando o estado selectedUF eh alterado de acordo com [selecteUF]
      console.log(selectedUF);  
      if (selectedUF === '0') {
            setCities([]);
            return;
        }
        axios.get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cities = response.data.map(function(city){
              return {
                label: city.nome,
                value: city.nome
              }
            });
            setCities(cities);
        })
    },[selectedUF]);
    useEffect(() => {
      console.log(selectedCity);
    },[selectedCity]);
    function handleNavigationPoints() {
      navigation.navigate('Points', {
        selectedUF,
        selectedCity
      });
    }
    return (
    <ImageBackground 
    source={require('../../assets/home-background.png')} 
    style={styles.container}
    imageStyle={{ width: 274, height: 368 }} // autura e largura da imagem
    >
        <View style={styles.main}>
            <Image source={require('../../assets/logo.png')} />
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
        </View>
        <View style={styles.footer}>
          <RNPickerSelect
            placeholder={{
              label: 'Selecione uma UF',
              value: null,
            }}
            items={ufs}
            onValueChange={setSelectedUF}
            useNativeAndroidPickerStyle={false} //android only
          />
          <RNPickerSelect
            placeholder={{
              label: 'Selecione uma cidade',
              value: null,
            }}
            items={cities}
            onValueChange={setSelectedCity}
            useNativeAndroidPickerStyle={false} //android only
          />
          <RectButton style={styles.button} onPress={handleNavigationPoints}>
              <View style={styles.buttonIcon}>
                  <Text>
                      <Icon name="arrow-right" color="#FFF" size={24} />
                  </Text>
              </View>
              <Text style={styles.buttonText}>
                  Entrar
              </Text>
          </RectButton>
        </View>
    </ImageBackground>
    );
};

const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 32
      },
    
      main: {
        flex: 1,
        justifyContent: 'center',
      },
    
      title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
      },
    
      description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
      },
    
      footer: {},
    
      select: {},
    
      input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
      },
    
      button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
      },
    
      buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
      },
    
      buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
      }
});

export default Home;