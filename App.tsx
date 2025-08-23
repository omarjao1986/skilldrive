
import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { apiGet, apiPost, setApiBase, setToken, getToken } from './src/api';

const Stack = createNativeStackNavigator();

function Row({ label, children }) {
  return (
    <View style={{ marginVertical: 6 }}>
      <Text style={{ fontSize: 12, color: '#555' }}>{label}</Text>
      {children}
    </View>
  );
}

function Button({ title, onPress, outline=false }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: outline ? 'transparent' : '#0ea5e9', borderWidth: outline ? 1 : 0, borderColor: '#0ea5e9' }}>
      <Text style={{ color: outline ? '#0ea5e9' : 'white', fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}

function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('+212600000000');
  const [name, setName] = useState('Omar');
  const [role, setRole] = useState<'CLIENT'|'PRO'>('CLIENT');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'ask'|'code'>('ask');
  const [apiBase, setApiBaseState] = useState('http://10.0.2.2:4000'); // Android emulator host
  const [loading, setLoading] = useState(false);

  useEffect(() => { setApiBase(apiBase); }, [apiBase]);

  async function requestOtp() {
    setLoading(true);
    try {
      await apiPost('/auth/otp/request', { phone });
      setStep('code');
      Alert.alert('Code envoyé', 'En dev, utilisez 0000.');
    } catch (e) {
      Alert.alert('Erreur', String(e));
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    setLoading(true);
    try {
      const res = await apiPost('/auth/otp/verify', { phone, code, name, role });
      await AsyncStorage.setItem('token', res.token);
      setToken(res.token);
      await AsyncStorage.setItem('role', role);
      navigation.replace('Home', { role });
    } catch (e) {
      Alert.alert('Erreur', String(e));
    } finally { setLoading(false); }
  }

  return (
    <View style={{ flex:1, padding:16, paddingTop: 48 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 12 }}>SkillLink</Text>
      <Row label='API Base (modifiez si besoin)'>
        <TextInput value={apiBase} onChangeText={setApiBaseState} placeholder='http://10.0.2.2:4000' style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
      </Row>
      {step==='ask' ? (
        <View>
          <Row label='Téléphone'><TextInput value={phone} onChangeText={setPhone} style={{ borderWidth:1, borderRadius:8, padding:10, borderColor:'#ddd' }} /></Row>
          <Row label='Nom'><TextInput value={name} onChangeText={setName} style={{ borderWidth:1, borderRadius:8, padding:10, borderColor:'#ddd' }} /></Row>
          <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
            <Button title={role==='CLIENT'?'Client ✓':'Client'} onPress={() => setRole('CLIENT')} outline={role!=='CLIENT'} />
            <Button title={role==='PRO'?'Pro ✓':'Pro'} onPress={() => setRole('PRO')} outline={role!=='PRO'} />
          </View>
          <Button title={loading?'...':'Recevoir le code'} onPress={requestOtp} />
        </View>
      ):(
        <View>
          <Row label='Code OTP'><TextInput value={code} onChangeText={setCode} placeholder='0000' style={{ borderWidth:1, borderRadius:8, padding:10, borderColor:'#ddd' }} keyboardType='number-pad' /></Row>
          <Button title={loading?'...':'Se connecter'} onPress={verifyOtp} />
        </View>
      )}
      <StatusBar style='auto' />
    </View>
  );
}

function HomeScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [near, setNear] = useState<string|undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [role, setRole] = useState<'CLIENT'|'PRO'>(route.params?.role || 'CLIENT');

  useEffect(() => { (async () => {
    const tok = await AsyncStorage.getItem('token'); if (tok) setToken(tok);
    refresh();
  })(); }, []);

  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      if (near && radiusKm) { params.set('near', near); params.set('radiusKm', String(radiusKm)); }
      const data = await apiGet('/requests?'+params.toString());
      setList(data);
    } catch (e) {
      Alert.alert('Erreur', String(e));
    } finally { setLoading(false); }
  }

  async function useMyLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Autorisation refusée');
    const pos = await Location.getCurrentPositionAsync({});
    const s = `${pos.coords.latitude},${pos.coords.longitude}`;
    setNear(s);
    refresh();
  }

  return (
    <View style={{ flex:1, padding:16, paddingTop: 8 }}>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TextInput placeholder='Recherche (ex: fuite, Rabat)' value={q} onChangeText={setQ} onSubmitEditing={refresh} style={{ flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} />
        <Button title='Chercher' onPress={refresh} />
      </View>

      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <TextInput placeholder='near lat,lng' value={near||''} onChangeText={setNear} style={{ flex:1, borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8 }} />
        <TextInput placeholder='rayon km' value={String(radiusKm)} onChangeText={(t)=>setRadiusKm(Number(t||10))} keyboardType='number-pad' style={{ width:100, borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8 }} />
        <Button title='Autour de moi' onPress={useMyLocation} outline />
      </View>

      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <Button title={role==='CLIENT'?'Client ✓':'Client'} onPress={()=>setRole('CLIENT')} outline={role!=='CLIENT'} />
        <Button title={role==='PRO'?'Pro ✓':'Pro'} onPress={()=>setRole('PRO')} outline={role!=='PRO'} />
        <Button title='Publier' onPress={()=>navigation.navigate('NewRequest')} />
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 24 }} /> : (
        <FlatList
          data={list}
          keyExtractor={(item)=>item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          renderItem={({item}) => (
            <TouchableOpacity onPress={()=>navigation.navigate('Request', { req: item, role })} style={{ borderWidth:1, borderColor:'#eee', borderRadius:12, padding:12, marginBottom:12 }}>
              <Text style={{ fontWeight:'700' }}>{item.title}</Text>
              <Text numberOfLines={2} style={{ color:'#444', marginTop:4 }}>{item.description}</Text>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:6 }}>
                <Text style={{ color:'#666' }}>{item.location}</Text>
                <Text style={{ color:'#111', fontWeight:'700' }}>{item.budgetMAD} MAD</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function NewRequestScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Rabat, Agdal');
  const [budgetMAD, setBudget] = useState('300');
  const [categorySlug, setCat] = useState('plomberie');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  async function submit() {
    try {
      const body = { title, description, location, budgetMAD: Number(budgetMAD), categorySlug, lat: lat?Number(lat):undefined, lng: lng?Number(lng):undefined };
      const created = await apiPost('/requests', body);
      Alert.alert('Publié', 'Votre demande est en ligne.');
      navigation.replace('Home', { refresh: true });
    } catch (e) {
      Alert.alert('Erreur', String(e));
    }
  }
  return (
    <View style={{ flex:1, padding:16 }}>
      <Row label='Titre'><TextInput value={title} onChangeText={setTitle} style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Description'><TextInput multiline value={description} onChangeText={setDescription} style={{ borderWidth:1, minHeight:100, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Localisation'><TextInput value={location} onChangeText={setLocation} style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Budget (MAD)'><TextInput value={budgetMAD} onChangeText={setBudget} keyboardType='number-pad' style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Catégorie slug (ex: plomberie, peinture)'><TextInput value={categorySlug} onChangeText={setCat} style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Latitude (optionnel)'><TextInput value={lat} onChangeText={setLat} keyboardType='decimal-pad' style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <Row label='Longitude (optionnel)'><TextInput value={lng} onChangeText={setLng} keyboardType='decimal-pad' style={{ borderWidth:1, borderColor:'#ddd', borderRadius:8, padding:10 }} /></Row>
      <View style={{ flexDirection:'row', gap:8, marginTop:12 }}>
        <Button title='Publier' onPress={submit} />
        <Button title='Annuler' onPress={()=>navigation.goBack()} outline />
      </View>
    </View>
  );
}

function RequestScreen({ route, navigation }) {
  const { req, role } = route.params;
  const [request, setRequest] = useState(req);
  const [price, setPrice] = useState('300');
  const [eta, setEta] = useState('4');
  const [message, setMessage] = useState("Je peux passer aujourd'hui.");

  useEffect(()=>{ setRequest(req); }, [req]);

  async function makeOffer() {
    try {
      await apiPost('/offers', { requestId: request.id, priceMAD: Number(price), etaHours: Number(eta), message });
      Alert.alert('Offre envoyée');
    } catch (e) { Alert.alert('Erreur', String(e)); }
  }

  async function accept(offerId) {
    try { await apiPost(`/offers/${offerId}/accept`, {}); Alert.alert('Accepté'); } catch (e) { Alert.alert('Erreur', String(e)); }
  }
  async function refuse(offerId) {
    try { await apiPost(`/offers/${offerId}/refuse`, {}); Alert.alert('Refusé'); } catch (e) { Alert.alert('Erreur', String(e)); }
  }
  async function counter(offerId) {
    try { await apiPost(`/offers/${offerId}/counter`, { priceMAD: Number(price), note: 'Proposition client' }); Alert.alert('Contre-offre envoyée'); } catch (e) { Alert.alert('Erreur', String(e)); }
  }
  async function markDone() {
    try { await apiPost(`/requests/${request.id}/done`, {}); Alert.alert('Clôturé'); } catch (e) { Alert.alert('Erreur', String(e)); }
  }

  async function uploadPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission refusée.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    const filename = asset.fileName || 'photo.jpg';
    const contentType = asset.mimeType || 'image/jpeg';
    try {
      const presign = await apiPost('/uploads/presign', { filename, contentType, requestId: request.id });
      const upload = presign.upload;
      const form = new FormData();
      Object.entries(upload.fields).forEach(([k,v]) => form.append(k, v as any));
      form.append('Content-Type', contentType);
      form.append('file', { uri: asset.uri, name: filename, type: contentType } as any);
      const s3res = await fetch(upload.url, { method:'POST', body: form });
      if (!s3res.ok) throw new Error('Upload S3 échoué');
      await apiPost('/uploads/attach', { requestId: request.id, key: presign.key, url: presign.publicUrl, contentType });
      Alert.alert('Photo ajoutée');
    } catch (e) { Alert.alert('Erreur', String(e)); }
  }

  async function pay(amountMAD:number) {
    try {
      const res = await apiPost('/payments/intent', { requestId: request.id, amountMAD });
      if (res.redirectUrl) {
        // TEST provider: simulate success
        await apiPost(`/payments/test/succeed/${res.intent.id}`, {});
        Alert.alert('Paiement TEST confirmé');
      } else if (res.gatewayUrl) {
        Alert.alert('Redirection CMI', 'Cette démo ouvre une webview dans la version finale.');
      }
    } catch (e) { Alert.alert('Erreur', String(e)); }
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'800' }}>{request.title}</Text>
      <Text style={{ color:'#555', marginTop:6 }}>{request.description}</Text>
      <Text style={{ marginTop:6, fontWeight:'700' }}>{request.budgetMAD} MAD</Text>

      <View style={{ flexDirection:'row', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {role==='PRO' && <Button title='Faire une offre' onPress={makeOffer} />}
        {role==='CLIENT' && <Button title='Clôturer' onPress={markDone} outline />}
        <Button title='Uploader photo' onPress={uploadPhoto} outline />
        <Button title='Payer 500 MAD' onPress={()=>pay(500)} />
      </View>

      <View style={{ marginTop:12 }}>
        <Row label='Prix (pour offre ou contre-offre)'><TextInput value={price} onChangeText={setPrice} keyboardType='number-pad' style={{ borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8 }} /></Row>
        <Row label='ETA (heures)'><TextInput value={eta} onChangeText={setEta} keyboardType='number-pad' style={{ borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8 }} /></Row>
        <Row label='Message'><TextInput value={message} onChangeText={setMessage} style={{ borderWidth:1, borderColor:'#eee', borderRadius:8, padding:8 }} /></Row>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown:false }} />
        <Stack.Screen name='Home' component={HomeScreen} options={{ title:'Demandes' }} />
        <Stack.Screen name='NewRequest' component={NewRequestScreen} options={{ title:'Publier' }} />
        <Stack.Screen name='Request' component={RequestScreen} options={{ title:'Détail' }} />
      </Stack.Navigator>
      <StatusBar style='auto' />
    </NavigationContainer>
  );
}
