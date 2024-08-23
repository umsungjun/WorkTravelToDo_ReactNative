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
import Feather from '@expo/vector-icons/Feather';

const STORAGE_KEY = '@toDos';
const WORKING_KEY = '@working';

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);

  const savedWorking = async (working) => {
    setWorking(working);
    try {
      await AsyncStorage.setItem(WORKING_KEY, working ? 'work' : 'travel');
    } catch (error) {
      console.error(error);
    }
  };
  const loadWorking = async () => {
    try {
      const working = await AsyncStorage.getItem(WORKING_KEY);
      if (working === 'travel') {
        setWorking(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
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
    const newToDo = {
      ...toDos,
      [Date.now()]: { text, working, isEdit: false, completed: false },
    };
    setToDos(newToDo);
    await savedToDos(newToDo);
    setText('');
  };

  const toggleEditToDoState = (key) => {
    setEditText(toDos[key].text);
    const newToDo = { ...toDos };
    newToDo[key].isEdit = !newToDo[key].isEdit;
    setToDos(newToDo);
    savedToDos(newToDo);
  };

  const editToDo = (key) => {
    const newToDo = { ...toDos };
    newToDo[key].text = editText;
    newToDo[key].isEdit = false;
    setToDos(newToDo);
    savedToDos(newToDo);
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
  const toggleCompleteToDo = (key) => {
    const newToDo = { ...toDos };
    newToDo[key].completed = !newToDo[key].completed;
    setToDos(newToDo);
    savedToDos(newToDo);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => savedWorking(true)}>
          <Text
            style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => savedWorking(false)}>
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
        placeholder={
          working ? 'What do you want to do?' : 'Where do you want to go?'
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) => {
          return toDos[key].working === working ? (
            <View style={styles.toDoBox} key={key}>
              <View style={styles.toDo}>
                <TouchableOpacity onPress={() => toggleCompleteToDo(key)}>
                  <Fontisto
                    name={`checkbox-${
                      toDos[key].completed ? 'active' : 'passive'
                    }`}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                {toDos[key].isEdit ? (
                  <TextInput
                    /* return key button type */
                    returnKeyType="done"
                    value={editText}
                    onChangeText={onChangeEditText}
                    placeholder={'edit ToDo'}
                    style={styles.editInput}
                  />
                ) : (
                  <Text
                    style={{
                      ...styles.toDoText,
                      textDecorationLine: `${
                        toDos[key].completed ? 'line-through' : ''
                      }`,
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                )}
              </View>
              <View style={styles.functionBox}>
                {toDos[key].isEdit ? (
                  <>
                    <TouchableOpacity onPress={() => editToDo(key)}>
                      <Fontisto name="check" size={20} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleEditToDoState(key)}>
                      <Fontisto name="close-a" size={20} color="gray" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => toggleEditToDoState(key)}>
                      <Feather name="edit" size={20} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={20} color="gray" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
  editInput: {
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: 12.5,
    borderRadius: 5,
    fontSize: 18,
    paddingVertical: 6,
  },
  toDoBox: {
    backgroundColor: theme.grey,
    marginBottom: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toDo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12.5,
    flex: 1,
  },
  toDoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 500,
    paddingVertical: 6,
  },
  functionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
