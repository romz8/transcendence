import { createToast } from "./components/toast";
import { getCookie } from "./user_login";

const DN = "localhost";
/********************************* GAME API INTERACTIONS *******************************************************/
export async function getPlayers(){
    try {
        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/players/`);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else{
            return [];
        }
    }
    catch (error) {
        return [];
    }
}


export async function getMatch(){
    try{
        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/allmatch/`);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else {
            return [];
        }
    }
    catch (error){
        return [];
    }
}

export async function postPlayer(formData){
    try 
    {
        var formJson = {};
        formData.forEach((value, key) => {
            formJson[key] = value;
        });
        let postData = JSON.stringify(formJson);
        let payload = {method: 'POST', 
            headers: {'Content-Type':'application/json'},
            body: postData,
        };
        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/players/`, payload);
        return resp;
        
    }
    catch(error){
        return [];
    }
}

export async function getWaitRoom(id){
    try{

        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/waitingroom/info/${id}`);
        if (resp.ok){
            let json = await resp.json();
            localStorage.setItem('waitroomId', json.genId); //to delete later on - only debug
            return json;
        }
        else if (resp.status === 404) {
            localStorage.removeItem('waitroomId'); // Clean up if room not found
            return {"error":"Waitroom not Found"};
        }
        else {
            return null;
        }
    }
    catch(error){
        return null;
    }
}

export async function getListWaitRoom(){
    try{

        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/waitingroom/listopen/`,{cache:'no-cache'});
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 404) {
            return null;
        }
        else {
            return null;
        }
    }
    catch(error){
        return null;
    }
}

export async function createWaitRoom(){
    try{
        let payload = {'method':'POST', headers: {'Content-Type':'application/json'}};
        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/waitingroom/create/`, payload);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 406)
        {
            let json = await resp.json();
            return json;
        }
        else return null;
    }
    catch(error){
        return null;
    }
}

export async function joinWaitRoom(roomId){
    try{
        let payload = {"method":"PUT", headers:{"Content-Type":"application/json"}};
        let endpoint = `https://${DN}:3001/tourapi/game/waitingroom/${roomId}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            return (json);
        }
        else{
            return null;
        }
    }
    catch(error){
        return null;
    }
}

export async function deleteWaitRoom(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const roomId = localStorage.getItem('waitroomId');
        if (!roomId){
            return null;
        }
        let endpoint = `https://${DN}:3001/tourapi/game/waitingroom/${roomId}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            localStorage.removeItem("waitroomId");
            return json;
        }
        else{
            let error_txt = await resp.text();
        }
    }
    catch(error)
    {
    }
}

/****************** TOURNAMENT API************************************/

export async function getListTournament(){
    try{

        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/openlist/`,{cache:'no-cache'});
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 404) {
            return null;
        }
        else {
            return null;
        }
    }
    catch(error){
        return null;
    }
}

export async function createTournament(size, n_humans){
    try{
        //ensuring data type are int for backend
        size = parseInt(size, 10);
        n_humans = parseInt(n_humans, 10);

        let payload = {'method':'POST', 
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({size, n_humans})}; 
        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/create/`, payload);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 406)
        {
            let json = await resp.json();
            createToast("warning", json.error)
            return json;
        }
        else return null;
    }
    catch(error){
        createToast("warning", error);
        return null;
    }
}


export async function joinTournament(Id){
    try{
        let payload = {"method":"POST", headers:{"Content-Type":"application/json"}};
        let endpoint = `https://${DN}:3001/tourapi/game/tournament/join/${Id}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            return (json);
        }
        else{
            return null;
        }
    }
    catch(error){
        return null;
    }
}

var tester = 0;

export async function getTournament(Id){
    try{

        let resp = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/${Id}`);
        if (resp.ok){
            let json = await resp.json();
            if (tester == 0)
            tester++;
            return json;
        }
        else if (resp.status === 404) {
            return null;
        }
        else {
            return null;
        }
    }
    catch(error){
        return null;
    }
}

export async function getPlayerListTournament(Id) {
    try {
        const response = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/${Id}/participants/`);
        const players = await response.json();
        return players;
    } catch (error) {
        return null;
    }
}

export async function getMatchesListTournament(Id) {
    try {
        const response = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/${Id}/matches/`);
        const players = await response.json();
        return players;
    } catch (error) {
        return null;
    }
}

export async function getPlayerTournnamentActive(id){
    try {
        const response = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/${id}/is_active/`);
        const players = await response.json();
        return players;
    } catch (error) {
        return null;
    }

}

export async function deleteTournament(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const tournamentId = localStorage.getItem('tournamentId');
        if (!tournamentId){
            return null;
        }
        let endpoint = `https://${DN}:3001/tourapi/game/tournament/delete/${tournamentId}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            localStorage.removeItem("tournamentId");
            return json;
        }
        else{
            let error_txt = await resp.text();
        }
    }
    catch(error)
    {
    }
}

export async function putMatchTest(id){
    try {
        let payload = {"method":"PATCH", headers:{"Content-Type":"application/json"}};
        const response = await fetchWithAuth(`https://${DN}:3001/tourapi/game/tournament/test/match/${id}/`, payload);
        const resp = await response.json();
        return resp;
    } catch (error) {
        return null;
    }
}


// ********************************* AUTH USER API INTERACTIONS *******************************************************

//**************TOKEN UTILS **************/
// Utility function to get access token
function getAccessToken(){
    let token = localStorage.getItem("token");
    if (!token){
        return null;
    }
    return token;
}

// Utility function to get refresh token
function getRefreshToken() {
    let token = localStorage.getItem("refresh");
    if (!token) {
        return null;
    }
    return token;
}

//Utility function to refresh Token if expired
async function refreshToken(){
    const refresh = getRefreshToken();
    let options = {
        method: "POST", 
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({refresh})
    };
    const resp = await fetch(`https://${DN}:3001/tourapi/apiAuth/refreshtoken/`, options);
    if (resp.ok){
        const newtokens = await resp.json();
        localStorage.setItem("access",newtokens.access);
        if (newtokens.refresh){
            localStorage.setItem("refresh", newtokens.refresh);
        }
        return newtokens.access;
    }
    else{
        return null;
    }
}

//Wrapper of fetch API calls to Fetch endpoint with Token Auth
async function fetchWithAuth(url, options = {}){
    let token = await getCookie("token");
    if (!token){
        token = await refreshToken();
    }
    let headers = options.headers || {}; //here we either create empty headers or use the on in options if passed
    headers['Authorization'] =`Bearer ${token}`;
    options.headers = headers;
    let resp = await fetch(url, options);
    if (resp.status == 401){
        let freshToken = await refreshToken();
        headers['Authorization'] =`Bearer ${freshToken}`;
        options.headers = headers;
        resp = await fetch(url, options);
    }
    let testing = resp.status
    return (resp);
}

//************** AUTH API INTERACTION **************/

export async function getAuth(){
    try {
        //let token = getAccessToken();
        let resp = await fetchWithAuth(`https://${DN}:3001/login/info_user/`) 
        //{headers: {'Authorization':`Bearer ${token}`}});
        if (resp.ok){
            let json = await resp.json();
            let txt_rep = JSON.stringify(json);
            return json;
        }
        else {
            return [];
        }
    }
    catch (error){
        return [];
    }
}

export async function leaveWaitRoom(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const roomId = localStorage.getItem('waitroomId');
        if (!roomId){
            return null;
        }
        let endpoint = `https://${DN}:3001/tourapi/game/waitingroom/${roomId}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            localStorage.removeItem("waitroomId");
            return resp;
        }
        else{
            let error_txt = await resp.text();
            return resp;
        }
    }
    catch(error)
    {
    }
}
