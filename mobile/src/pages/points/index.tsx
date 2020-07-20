import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Emoji from 'react-native-emoji';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg'; // permite carregar um arquivo svg de um componente externo
import { AppLoading } from 'expo';
import * as Location from 'expo-location';

import api from '../../services/api';

const Points = () => {
    interface Item {
      id_item: number;
      title: string;
      imagem_url: string;
    }
    interface Point {
      id_point: number;
      name: string;
      image: string;
      image_url: string;
      latitude: number;
      longitude: number;
    }
    interface Params {
      uf: string;
      city: string;
    }
    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [initialPosition, setInitialposition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params as Params;
    console.log(`Cidade ${routeParams.city} e UF ${routeParams.uf}`);
    useEffect(() => {
      async function loadPosition() {
        const { status } = await Location.requestPermissionsAsync(); // busca permissão para acessar a localização
        if (status !== 'granted') {
          Alert.alert('Oooops...', 'Precisamos de sua permissão para obter sua localização atual');
          return;
        }
        const location = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = location.coords;
        setInitialposition([
          latitude,
          longitude
        ]);
      }
      loadPosition();
    }, []);
    useEffect(() => {
      api.get('points', {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: selectedItems
        }
      }).then(response => {
        setPoints(response.data);
      });
    }, [selectedItems]);
    useEffect(() => {
        api.get('items').then(response => {
          setItems(response.data); // response eh um obj
        });
    }, []);
    if (!items) { // Enquanto as fontes nao carregarem mostra a tela de loading importada do expo
      return <AppLoading />
    }
    function handleNavigateBack() {
        navigation.goBack();
    }
    function handleNavigateToDetail(id: Number) {
        navigation.navigate('Detail', { point_id: id });
    }
    function handleSelectedItem(id: number) {
      const alreadySelected = selectedItems.findIndex(item => item === id); // procura o id na lista de selecionados
      if(alreadySelected >= 0) {
        setSelectedItems(selectedItems.filter(item => item !== id)); // carrega com a lista de ids que sao diferentes do selecionado
      } else {
        setSelectedItems([ ...selectedItems, id ]);
      }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>
                <Text style={styles.title}><Emoji name=":blush:" style={{fontSize: 50}} />Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
                <View style={styles.mapContainer}>
                    { initialPosition[0] !== 0 && ( // if (initialPosition[0] !== 0) ...
                      <MapView 
                      style={styles.map}
                      initialRegion={{ 
                          latitude: initialPosition[0],
                          longitude: initialPosition[1],
                          latitudeDelta: 0.014,
                          longitudeDelta: 0.014,
                       }}
                       >
                          {points.map(point => (
                            <Marker 
                            key={String(point.id_point)}
                            style={styles.mapMarker}
                            onPress={() => handleNavigateToDetail(point.id_point)}
                            coordinate={{ 
                                latitude: Number(point.latitude),
                                longitude: Number(point.longitude),
                             }} 
                            >
                                <View style={styles.mapMarkerContainer}>
                                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                                    <Text style={styles.mapMarkerContainer}>{point.name}</Text>
                                </View>
                            </Marker>
                          ))}
                       </MapView>
                    ) }
                </View>
            </View>
            { items !== [] && (
              <View style={styles.itemsContainer}>
                <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {items.map(item => (
                      <TouchableOpacity 
                      key={String(item.id_item)}
                      onPress={() => handleSelectedItem(item.id_item)}
                      style={[
                        styles.item, 
                        selectedItems.includes(item.id_item) ? styles.selectedItem : {}
                      ]}
                      activeOpacity={0.6}
                      >
                        <SvgUri width={42} height={42} uri={item.imagem_url} />
                        <Text style={styles.itemTitle}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            ) }
        </SafeAreaView>
    ) 
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 45,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });

export default Points;