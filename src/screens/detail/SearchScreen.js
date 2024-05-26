/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback, useEffect, useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {
  COLOR_WHITE,
  COLOR_BACKGROUND,
  COLOR_GRAY,
  COLOR_PRIMARY,
  COLOR_TEXT_BLACK,
  COLOR_TEXT70GRAY,
  COLOR_TEXT60GRAY,
} from '../../assets/color';
import AnimatedButton from '../../components/AnimationButton';
import Header from '../../components/Header';
import {useNavigation} from '@react-navigation/native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {BlurView} from '@react-native-community/blur';
import {SvgXml} from 'react-native-svg';
import {svgXml} from '../../assets/svg';
import MapDart from '../../components/MapDart';
import Modal from 'react-native-modal';
import {Dimensions} from 'react-native';
import {FlatList, TextInput} from 'react-native-gesture-handler';
import StoreCompo from '../../components/StoreCompo';
import axios, {AxiosError} from 'axios';
import {API_URL, AUTO_COMPLETE} from '@env';
import AppContext from '../../components/AppContext';

const windowWidth = Dimensions.get('window').width;

export default function SearchScreen(props) {
  const navigation = useNavigation();
  const context = useContext(AppContext);

  const {route} = props;
  const setSearch = route.params?.setSearch;

  const [searchText, setSearchText] = useState('');
  const [recentSearch, setRecentSearch] = useState([]);

  const [autoCompleteData, setAutoCompleteData] = useState([]);

  useEffect(() => {
    initRecentSearch();
  }, []);

  const autocomplete = async inputString => {
    console.log('검색어:', inputString);
    try {
      const params = {
        query: inputString,
      };

      const queryString = new URLSearchParams(params).toString();

      const response = await axios.get(`${AUTO_COMPLETE}?${queryString}`, {
        headers: {Authorization: `Bearer ${context.accessToken}`},
      });

      console.log('response:', response.data.results);

      setAutoCompleteData(response.data.results);
    } catch (e) {
      console.log('error', e);
    }
  };

  const initRecentSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/recents`, {
        headers: {Authorization: `Bearer ${context.accessToken}`},
      });

      console.log('response:', response.data.data.recentQueries);

      setRecentSearch(response.data.data.recentQueries);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log('Axios error:', e.response ? e.response.data : e.message);
      } else {
        console.log('splash error', e.message);
      }
    }
  };

  const deleteRecentSearch = async query => {
    try {
      console.log('context.accessToken:', context.accessToken);

      const response = await axios.delete(`${API_URL}/v1/recents`, {
        headers: {Authorization: `Bearer ${context.accessToken}`},
        data: {query: query},
      });

      console.log('response:', response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log('Axios error:', e.response ? e.response.data : e.message);
      } else {
        console.log('splash error', e.message);
      }
    }
  };

  return (
    <>
      <Header title={'검색'} isBackButton={true} />
      <View style={styles.entire}>
        <View style={{alignItems: 'center'}}>
          {/* 검색창 */}
          <View
            style={{
              width: windowWidth - 32,
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 4,
              paddingHorizontal: 8,
              elevation: 4,
              marginVertical: 15,
              justifyContent: 'center',

              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <AnimatedButton
              onPress={() => {
                setSearch(searchText);
                navigation.goBack();
              }}
              style={{
                padding: 8,
              }}>
              <SvgXml xml={svgXml.icon.search} width="24" height="24" />
            </AnimatedButton>
            <TextInput
              placeholder={'율전의 맛집은 과연 어디?'}
              placeholderTextColor={'#888888'}
              style={styles.textInput}
              onChangeText={text => {
                setSearchText(text);
                autocomplete(text);
              }}
              blurOnSubmit={false}
              maxLength={200}
              value={searchText}
              onSubmitEditing={() => {
                setSearch(searchText);
                navigation.goBack();
              }}
              textAlignVertical="center"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              numberOfLines={1}
            />
          </View>
        </View>

        {/* 최근 검색어 부분 */}
        {searchText.length == 0 ? (
          <View style={{}}>
            <View style={styles.recentHeader}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLOR_TEXT_BLACK,
                  fontWeight: 'bold',
                }}>
                최근 검색어
              </Text>
              <AnimatedButton
                onPress={() => {
                  console.log('최근 검색어 전부 삭제');
                  setRecentSearch([]);

                  for (let i = 0; i < recentSearch.length; i++) {
                    deleteRecentSearch(recentSearch[i].query);
                  }
                }}
                style={{marginLeft: 10}}>
                <Text style={{fontSize: 12, color: COLOR_TEXT60GRAY}}>
                  전체 삭제
                </Text>
              </AnimatedButton>
            </View>
            <View style={{height: 80}}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  paddingTop: 15,
                }}>
                <View style={{width: 16}} />

                {recentSearch.map((item, index) => {
                  return (
                    <>
                      <AnimatedButton
                        style={styles.filterButton}
                        onPress={() => {
                          console.log('press item:', item.query);
                          setSearch(item.query);
                          navigation.goBack();
                        }}>
                        <Text style={styles.recentText}>{item.query}</Text>
                        <AnimatedButton
                          onPress={() => {
                            console.log('삭제');
                            deleteRecentSearch(item.query);
                            setRecentSearch(prevQueries =>
                              prevQueries.filter(q => q.query !== item.query),
                            );
                          }}>
                          <SvgXml
                            xml={svgXml.icon.close}
                            width="18"
                            height="18"
                          />
                        </AnimatedButton>
                      </AnimatedButton>

                      <View style={{width: 16}} />
                    </>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.searchArea}>
            <FlatList
              data={autoCompleteData}
              renderItem={({item, index}) => {
                return (
                  <AnimatedButton
                    style={styles.listButton}
                    onPress={async () => {
                      setSearch(item.org_display);
                      navigation.goBack();
                    }}>
                    <SvgXml xml={svgXml.icon.search} width="18" height="18" />
                    <Text style={styles.buttonText}>{item.org_display}</Text>
                  </AnimatedButton>
                );
              }}
            />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  entire: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
    alignItems: 'center',
  },
  textInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 12,
    color: COLOR_TEXT_BLACK,
    padding: 0,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    width: windowWidth - 32,
    // backgroundColor: 'blue',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    paddingHorizontal: 7,
    borderRadius: 15,
    backgroundColor: COLOR_PRIMARY,
    height: 24,
  },
  recentText: {
    fontSize: 12,
    color: COLOR_WHITE,
    marginRight: 5,
  },
  searchArea: {
    // backgroundColor: 'blue',
    flex: 1,
    width: windowWidth,
  },
  touchArea: {
    // backgroundColor: 'blue',
    flex: 1,
    width: windowWidth,
  },
  listButton: {
    // backgroundColor: 'blue',
    padding: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 12,
    color: COLOR_TEXT_BLACK,
    fontWeight: 'normal',
    marginLeft: 2,
  },
});