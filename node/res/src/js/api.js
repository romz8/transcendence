import { getCookie } from "./user_login";

const DN = "localhost";
/********************************* GAME API INTERACTIONS *******************************************************/
export async function getPlayers(){
    try {
        let resp = await fetchWithAuth(`http://${DN}:8000/game/players/`);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else{
            console.error('Error loading the player list', response.statusText);
            return [];
        }
    }
    catch (error) {
        console.error("Error fetching players:", error);
        return [];
    }
}


export async function getMatch(){
    try{
        let resp = await fetchWithAuth(`http://${DN}:8000/game/allmatch/`);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else {
            console.error('Error loading the list of all matches', resp.statusText);
            return [];
        }
    }
    catch (error){
        console.log("Error fetching list of all match", error);
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
        console.log("string json is :" + postData);
        let payload = {method: 'POST', 
            headers: {'Content-Type':'application/json'},
            body: postData,
        };
        let resp = await fetchWithAuth(`http://${DN}:8000/game/players/`, payload);
        return resp;
        
    }
    catch(error){
        console.log("error on post reqeust is" + error);
        return [];
    }
}

export async function getWaitRoom(id){
    try{

        let resp = await fetchWithAuth(`http://${DN}:8000/game/waitingroom/info/${id}`);
        if (resp.ok){
            let json = await resp.json();
            console.log("from json ", json);
            localStorage.setItem('waitroomId', json.genId); //to delete later on - only debug
            return json;
        }
        else if (resp.status === 404) {
            console.log("Wait room not found");
            localStorage.removeItem('waitroomId'); // Clean up if room not found
            return {"error":"Waitroom not Found"};
        }
        else {
            return null;
        }
    }
    catch(error){
        console.log("error" + error);
        return null;
    }
}

export async function getListWaitRoom(){
    try{

        let resp = await fetchWithAuth(`http://${DN}:8000/game/waitingroom/listopen/`,{cache:'no-cache'});
        if (resp.ok){
            let json = await resp.json();
            // console.log("from json ", json);
            return json;
        }
        else if (resp.status === 404) {
            console.log("Wait room not found");
            return null;
        }
        else {
            return null;
        }
    }
    catch(error){
        console.log("error" + error);
        return null;
    }
}

export async function createWaitRoom(){
    try{
        let payload = {'method':'POST', headers: {'Content-Type':'application/json'}};
        let resp = await fetchWithAuth(`http://${DN}:8000/game/waitingroom/create/`, payload);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 406)
        {
            console.log("Room already exists");
            let json = await resp.json();
            console.log("json is : ", json);
            return json;
        }
        else return null;
    }
    catch(error){
        console.log("error" + error);
        return null;
    }
}

export async function joinWaitRoom(roomId){
    try{
        let payload = {"method":"PUT", headers:{"Content-Type":"application/json"}};
        let endpoint = `http://${DN}:8000/game/waitingroom/join/${roomId}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        console.log("resp is : ", resp);
        if (resp.ok){
            let json = await resp.json();
            console.log("json in OK is : ", json);
            return (json);
        }
        else{
            console.log("error in API call ", await resp.text());
            return null;
        }
    }
    catch(error){
        console.log("erroor is : ", error);
        return null;
    }
}

export async function deleteWaitRoom(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const roomId = localStorage.getItem('waitroomId');
        console.log("roomId is : ", roomId);
        if (!roomId){
            return null;
        }
        let endpoint = `http://${DN}:8000/game/waitingroom/delete/${roomId}/`;
        console.log("delete path is ", endpoint);
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            localStorage.removeItem("waitroomId");
            return json;
        }
        else{
            let error_txt = await resp.text();
            console.log("issue on deleting the ressrouce", error_txt);
        }
    }
    catch(error)
    {
        console.log("Caught Error : ", error);
    }
}

/****************** TOURNAMENT API************************************/

export async function getListTournament(){
    try{

        let resp = await fetchWithAuth(`http://${DN}:8000/game/tournament/openlist/`,{cache:'no-cache'});
        if (resp.ok){
            let json = await resp.json();
            // console.log("from json ", json);
            return json;
        }
        else if (resp.status === 404) {
            console.log("Wait room not found");
            return null;
        }
        else {
            return null;
        }
    }
    catch(error){
        console.log("error" + error);
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
        let resp = await fetchWithAuth(`http://${DN}:8000/game/tournament/create/`, payload);
        if (resp.ok){
            let json = await resp.json();
            return json;
        }
        else if (resp.status === 406)
        {
            console.log("Tournament already exists");
            let json = await resp.json();
            console.log("json with error is : ", json);
            return json;
        }
        else return null;
    }
    catch(error){
        console.log("error" + error);
        return null;
    }
}


export async function joinTournament(Id){
    try{
        let payload = {"method":"POST", headers:{"Content-Type":"application/json"}};
        let endpoint = `http://${DN}:8000/game/tournament/join/${Id}/`;
        let resp = await fetchWithAuth(endpoint, payload);
        console.log("resp is : ", resp);
        if (resp.ok){
            let json = await resp.json();
            console.log("json in OK is : ", json);
            return (json);
        }
        else{
            console.log("error in API call ", await resp.text());
            return null;
        }
    }
    catch(error){
        console.log("error is : ", error);
        return null;
    }
}

var tester = 0;

export async function getTournament(Id){
    try{

        let resp = await fetchWithAuth(`http://${DN}:8000/game/tournament/${Id}`);
        // console.log(resp.status)
        if (resp.ok){
            let json = await resp.json();
            if (tester == 0)
                console.log("from json ", json);
            tester++;
            return json;
        }
        else if (resp.status === 404) {
            console.log("Tournament not found");
            return null;
        }
        else {
            console.log("error in getTournament :" + error);
            return null;
        }
    }
    catch(error){
        console.log("error" + error);
        return null;
    }
}

export async function getPlayerListTournament(Id) {
    try {
        const response = await fetchWithAuth(`http://${DN}:8000/game/tournament/${Id}/participants/`);
        const players = await response.json();
        // console.log("in list playe api call reuslt is : ", players);
        return players;
    } catch (error) {
        console.error('Error fetching players:', error);
        return null;
    }
}

export async function getMatchesListTournament(Id) {
    try {
        const response = await fetchWithAuth(`http://${DN}:8000/game/tournament/${Id}/matches/`);
        const players = await response.json();
        // console.log("in list playe api call reuslt is : ", players);
        return players;
    } catch (error) {
        console.error('Error fetching players:', error);
        return null;
    }
}

export async function getPlayerTournnamentActive(id){
    try {
        const response = await fetchWithAuth(`http://${DN}:8000/game/tournament/${id}/is_active/`);
        const players = await response.json();
        // console.log("in list playe api call reuslt is : ", players);
        return players;
    } catch (error) {
        console.error('Error fetching players:', error);
        return null;
    }

}

export async function deleteTournament(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const tournamentId = localStorage.getItem('tournamentId');
        console.log("tournamentId is : ", tournamentId);
        if (!tournamentId){
            return null;
        }
        let endpoint = `http://${DN}:8000/game/tournament/delete/${tournamentId}/`;
        console.log("delete path is ", endpoint);
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok){
            let json = await resp.json();
            localStorage.removeItem("tournamentId");
            return json;
        }
        else{
            let error_txt = await resp.text();
            console.log("issue on deleting the ressrouce", error_txt);
        }
    }
    catch(error)
    {
        console.log("Caught Error : ", error);
    }
}

export async function putMatchTest(id){
    try {
        let payload = {"method":"PATCH", headers:{"Content-Type":"application/json"}};
        const response = await fetchWithAuth(`http://${DN}:8000/game/tournament/test/match/${id}/`, payload);
        const resp = await response.json();
        console.log("in list playe api call reuslt is : ", resp);
        return resp;
    } catch (error) {
        console.error('Error fetching players:', error);
        return null;
    }
}


// ********************************* AUTH USER API INTERACTIONS *******************************************************

//**************TOKEN UTILS **************/
// Utility function to get access token
function getAccessToken(){
    let token = localStorage.getItem("token");
    console.log(token)
    if (!token){
        console.log("missing token");
        return null;
    }
    return token;
}

// Utility function to get refresh token
function getRefreshToken() {
    let token = localStorage.getItem("refresh");
    if (!token) {
        console.log("Missing refresh token");
        return null;
    }
    return token;
}

//Utility function to refresh Token if expired
async function refreshToken(){
    const refresh = getRefreshToken();
    console.log("before starting access tkn is :" + localStorage.getItem("access"));
    let options = {
        method: "POST", 
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({refresh})
    };
    const resp = await fetch(`http://${DN}:8000/apiAuth/refreshtoken/`, options);
    if (resp.ok){
        const newtokens = await resp.json();
        localStorage.setItem("access",newtokens.access);
        if (newtokens.refresh){
            localStorage.setItem("refresh", newtokens.refresh);
        }
        console.log("token roll succesful");
        console.log("After roll tkn is :" + localStorage.getItem("access"));
        return newtokens.access;
    }
    else{
        console.log("Issue refreshing token");
        return null;
    }
}

//Wrapper of fetch API calls to Fetch endpoint with Token Auth
async function fetchWithAuth(url, options = {}){
    let token = getCookie("token");
    if (!token){
        token = await refreshToken();
    }
    let headers = options.headers || {}; //here we either create empty headers or use the on in options if passed
    headers['Authorization'] =`Bearer ${token}`;
    options.headers = headers;
    // console.log("in fetch with AUth url is : " + url);
    let resp = await fetch(url, options);
    if (resp.status == 401){
        console.log("refreshig token in fetch wrapper");
        let freshToken = await refreshToken();
        console.log("in fetch wraper we received token" + freshToken);
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
        let resp = await fetchWithAuth(`http://${DN}:8080/info_user/`) 
        //{headers: {'Authorization':`Bearer ${token}`}});
        if (resp.ok){
            let json = await resp.json();
            let txt_rep = JSON.stringify(json);
            // console.log("json is : " + txt_rep);
            return json;
        }
        else {
            console.error('Error loading the authentication', resp.statusText);
            return [];
        }
    }
    catch (error){
        console.log("Error fetching authentication", error);
        return [];
    }
}

export async function leaveWaitRoom(){
    try{
        let payload = {'method':'DELETE', headers: {'Content-Type':'application/json'}};
        const roomId = localStorage.getItem('waitroomId');
        console.log("roomId is : ", roomId);
        if (!roomId){
            return null;
        }
        let endpoint = `http://${DN}:8000/game/waitingroom/delete/${roomId}/`;
        console.log("delete path is ", endpoint);
        let resp = await fetchWithAuth(endpoint, payload);
        if (resp.ok)
            localStorage.removeItem("waitroomId");
        else{
            let error_txt = await resp.text();
            console.log("issue on deleting the ressrouce", error_txt);
        }
        return resp;

    }
    catch(error)
    {
        console.log("Caught Error : ", error);
    }
}
