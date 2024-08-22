import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  // TouchableHighlight,
  // TouchableWithoutFeedback,
} from 'react-native';
import { theme } from './colors';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Fontisto from '@expo/vector-icons/Fontisto';

const STORAGE_KEY = '@toDos';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadToDos();
  }, []);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const savedToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error(error);
    }
  };
  const loadToDos = async () => {
    try {
      const saveToDos = await AsyncStorage.getItem(STORAGE_KEY);
      if (saveToDos) {
        setToDos(JSON.parse(saveToDos));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addToDo = async () => {
    if (text === '') return;
    const newToDo = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDo);
    await savedToDos(newToDo);
    setText('');
  };

  const deleteToDo = (key) => {
    Alert.alert('delete ToDo?', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'I"m Sure',
        style: 'destructive',
        onPress: () => {
          const newToDo = { ...toDos };
          delete newToDo[key];
          setToDos(newToDo);
          savedToDos(newToDo);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? 'white' : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        /* return key button type */
        returnKeyType="done"
        value={text}
        onChangeText={onChangeText}
        placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => {
          return toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color="gray" />
              </TouchableOpacity>
            </View>
          ) : null;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 12.5,
    borderRadius: 5,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 15,
    paddingVertical: 15,
    paddingLeft: 50,
    paddingRight: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
  },
});
