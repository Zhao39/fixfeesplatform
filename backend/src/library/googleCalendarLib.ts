import { ASSETS_DIR, GOOGLE_CLIENT_SECRET_JSON } from "../var/env.config";

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function initializeOAuth2Client(redirect_uri) {
    try {
        let client_secret_path = `assets/global/google/${GOOGLE_CLIENT_SECRET_JSON}`;
        if (ASSETS_DIR !== "") {
            client_secret_path = `${ASSETS_DIR}/global/google/${GOOGLE_CLIENT_SECRET_JSON}`;
        }
        const credentials = JSON.parse(fs.readFileSync(client_secret_path));
        const { client_secret, client_id, redirect_uris } = credentials.web;
        const client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
        return client
    } catch (e) {
        console.log(`initializeOAuth2Client error:::`, e)
    }
}

export default class GoogleCalendarLib {
    constructor() {

    }

    /**
     * get oAuth2Client
     */
    public getOAuth2Client = async (redirect_uri) => {
        const oAuth2Client = initializeOAuth2Client(redirect_uri)
        return oAuth2Client
    }

    /**
     * get auth url
     */
    public getAuthUrl = async (oAuth2Client) => {
        try {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent', // Force consent to ensure a refresh token is returned
                scope: SCOPES,
            });
            return authUrl
        } catch (e) {
            console.log(`getAuthUrl error:::`, e)
        }
    }

    /**
     * process oauth2Callback
     */
    public oauth2Callback = (req, oAuth2Client) => {
        return new Promise(function (resolve, reject) {
            const code = req.query.code;
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.log(`oauth2callback code err:::`, code, err)
                    resolve({ error: 'Error retrieving access token' })
                } else {
                    console.log(`oauth2callback code token:::`, code, token)
                    oAuth2Client.setCredentials(token);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                    resolve({ code: code, token: token, message: 'Authentication successful! You can close this tab.' })
                }
            });
        });
    }

    /**
    * get events
    */
    public getEvents = (tokenStr, oAuth2Client) => { // token is the one that was saved in oauth2Callback process
        try {
            const token = JSON.parse(tokenStr)
            return new Promise(async (resolve, reject) => {
                let newTokenObj = null
                oAuth2Client.setCredentials(token);

                if (oAuth2Client.isTokenExpiring()) {
                    try {
                        const newToken = await oAuth2Client.refreshAccessToken();
                        newTokenObj = newToken.credentials
                        oAuth2Client.setCredentials(newTokenObj);
                    } catch (error) {
                        newTokenObj = null
                        console.error('Error refreshing access token', error);
                    }
                }

                const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
                calendar.events.list(
                    {
                        calendarId: 'primary',
                        //timeMin: new Date().toISOString(),
                        //maxResults: 10,
                        singleEvents: true,
                        orderBy: 'startTime',
                    },
                    (err, response) => {
                        if (err) {
                            console.log(`getEvents err:::`, err, tokenStr)
                            resolve({ error: 'Error fetching events', newTokenObj: newTokenObj })
                        } else {
                            resolve({ items: response.data.items, newTokenObj: newTokenObj })
                        }
                    }
                );
            });
        } catch (e) {
            console.log(`getEvents error::::::`, e, tokenStr)
            return { error: 'Invalid request' }
        }
    }

    /**
    * create an event
    */
    public createEvent = (tokenStr, eventInfo, oAuth2Client) => { // token is the one that was saved in oauth2Callback process
        try {
            const token = JSON.parse(tokenStr)
            return new Promise(async (resolve, reject) => {
                let newTokenObj = null
                oAuth2Client.setCredentials(token);

                if (oAuth2Client.isTokenExpiring()) {
                    try {
                        const newToken = await oAuth2Client.refreshAccessToken();
                        newTokenObj = newToken.credentials
                        oAuth2Client.setCredentials(newTokenObj);
                    } catch (error) {
                        newTokenObj = null
                        console.error('Error refreshing access token', error);
                    }
                }

                const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

                calendar.events.insert(
                    {
                        calendarId: 'primary',
                        resource: eventInfo,
                    },
                    (err, event) => {
                        if (err) {
                            console.log(`createEvent err:::::`, err)
                            resolve({ error: 'Error creating event', newTokenObj: newTokenObj })
                        } else {
                            console.log(`createEvent event:::`, event)
                            resolve({ event_data: event.data, newTokenObj: newTokenObj })
                        }
                    }
                )
            })
        } catch (e) {
            console.log(`createEvent error:::::`, eventInfo, e)
            return { error: 'Invalid request' }
        }

    }

    /**
    * update an event
    */
    public updateEvent = (tokenStr, eventId, eventInfo, oAuth2Client) => { // token is the one that was saved in oauth2Callback process
        try {
            const token = JSON.parse(tokenStr)
            return new Promise(async (resolve, reject) => {
                let newTokenObj = null
                oAuth2Client.setCredentials(token);

                if (oAuth2Client.isTokenExpiring()) {
                    try {
                        const newToken = await oAuth2Client.refreshAccessToken();
                        newTokenObj = newToken.credentials
                        oAuth2Client.setCredentials(newTokenObj);
                    } catch (error) {
                        newTokenObj = null
                        console.error('Error refreshing access token', error);
                    }
                }

                const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

                calendar.events.patch( //patch, update
                    {
                        calendarId: 'primary',
                        eventId: eventId,
                        resource: eventInfo,
                    },
                    (err, event) => {
                        if (err) {
                            console.log(`updateEvent err:::::`, err)
                            resolve({ error: 'Error update event', newTokenObj: newTokenObj })
                        } else {
                            console.log(`updateEvent event:::`, event)
                            resolve({ event_data: event.data, newTokenObj: newTokenObj })
                        }
                    }
                )
            })
        } catch (e) {
            console.log(`updateEvent error:::::`, eventInfo, e)
            return { error: 'Invalid request' }
        }

    }

    /**
    * delete an event
    */
    public deleteEvent = (tokenStr, eventId, oAuth2Client) => { // token is the one that was saved in oauth2Callback process
        try {
            const token = JSON.parse(tokenStr)
            return new Promise(async (resolve, reject) => {
                let newTokenObj = null
                oAuth2Client.setCredentials(token);

                if (oAuth2Client.isTokenExpiring()) {
                    try {
                        const newToken = await oAuth2Client.refreshAccessToken();
                        newTokenObj = newToken.credentials
                        oAuth2Client.setCredentials(newTokenObj);
                    } catch (error) {
                        newTokenObj = null
                        console.error('Error refreshing access token', error);
                    }
                }

                const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

                calendar.events.delete(
                    {
                        calendarId: 'primary',
                        eventId: eventId,
                    },
                    (err) => {
                        if (err) {
                            console.log(`deleteEvent err:::::`, err)
                            resolve({ error: 'Error update event', newTokenObj: newTokenObj })
                        } else {
                            resolve({ eventId: eventId, newTokenObj: newTokenObj })
                        }
                    }
                )
            })
        } catch (e) {
            console.log(`deleteEvent error:::::`, eventId, e)
            return { error: 'Invalid request' }
        }
    }

    /**
    * get colors
    */
    public getColors = (tokenStr, oAuth2Client) => { // token is the one that was saved in oauth2Callback process
        try {
            const token = JSON.parse(tokenStr)
            return new Promise(async (resolve, reject) => {
                let newTokenObj = null
                oAuth2Client.setCredentials(token);

                if (oAuth2Client.isTokenExpiring()) {
                    try {
                        const newToken = await oAuth2Client.refreshAccessToken();
                        newTokenObj = newToken.credentials
                        oAuth2Client.setCredentials(newTokenObj);
                    } catch (error) {
                        newTokenObj = null
                        console.error('Error refreshing access token', error);
                    }
                }

                const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
                calendar.colors.get(
                    (err, response) => {
                        if (err) {
                            console.log(`getcolors err:::`, err, tokenStr)
                            resolve({ error: 'Error fetching colors', newTokenObj: newTokenObj })
                        } else {
                            resolve({ items: response.data, newTokenObj: newTokenObj })
                        }
                    }
                );
            });
        } catch (e) {
            console.log(`getcolors error::::::`, e, tokenStr)
            return { error: 'Invalid request' }
        }
    }

}

export const googleCalendarLib = new GoogleCalendarLib()