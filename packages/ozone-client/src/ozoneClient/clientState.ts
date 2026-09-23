import { State, Transitions } from 'typescript-state-machine'

export class ClientState extends State {
}

export const states = {
	STOPPED: new ClientState('STOPPED'),
	STARTED: new ClientState('STARTED'),
	AUTHENTICATING: new ClientState('AUTHENTICATING'),
	AUTHENTICATED: new ClientState('AUTHENTICATED'),
	NETWORK_OR_SERVER_ERROR: new ClientState('NETWORK_OR_SERVER_ERROR'),
	AUTHENTICATION_ERROR: new ClientState('AUTHENTICATION_ERROR'),
	WS_CONNECTING: new ClientState('WS_CONNECTING'),
	WS_CONNECTED: new ClientState('WS_CONNECTED'),
	WS_CONNECTION_ERROR: new ClientState('WS_CONNECTION_ERROR'),
	STOPPING: new ClientState('STOPPING')
}

export const validTransitions: Transitions<ClientState> = {}
validTransitions[states.STOPPED.label] = [states.STARTED]
validTransitions[states.STARTED.label] = [states.AUTHENTICATING]
validTransitions[states.AUTHENTICATING.label] = [states.STOPPING, states.AUTHENTICATION_ERROR, states.NETWORK_OR_SERVER_ERROR, states.AUTHENTICATED]
validTransitions[states.AUTHENTICATED.label] = [states.STOPPING, states.WS_CONNECTING, states.AUTHENTICATING]
validTransitions[states.AUTHENTICATION_ERROR.label] = [states.STOPPING, states.AUTHENTICATING]
validTransitions[states.NETWORK_OR_SERVER_ERROR.label] = [states.STOPPING, states.AUTHENTICATING]
validTransitions[states.WS_CONNECTING.label] = [states.STOPPING, states.WS_CONNECTED, states.WS_CONNECTION_ERROR, states.AUTHENTICATING]
validTransitions[states.WS_CONNECTED.label] = [states.STOPPING, states.WS_CONNECTION_ERROR, states.AUTHENTICATING]
validTransitions[states.WS_CONNECTION_ERROR.label] = [states.STOPPING, states.WS_CONNECTING, states.AUTHENTICATING]
validTransitions[states.STOPPING.label] = [states.STOPPED]

/*
    digraph G {
        "STOPPED" -> "STARTED"
        "STARTED" -> "AUTHENTICATING"
        "AUTHENTICATING" -> "STOPPING"
        "AUTHENTICATING" -> "AUTHENTICATION_ERROR"
        "AUTHENTICATING" -> "AUTHENTICATED"
        "AUTHENTICATING" -> "NETWORK_OR_SERVER_ERROR"
        "AUTHENTICATION_ERROR" -> "STOPPING"
        "AUTHENTICATION_ERROR" -> "AUTHENTICATING"
        "NETWORK_OR_SERVER_ERROR" -> "STOPPING"
        "NETWORK_OR_SERVER_ERROR" -> "AUTHENTICATING"
        "WS_CONNECTING" -> "STOPPING"
        "WS_CONNECTING" -> "WS_CONNECTED"
        "WS_CONNECTING" -> "WS_CONNECTION_ERROR"
        "WS_CONNECTING" -> "AUTHENTICATING"
        "WS_CONNECTING" -> "NETWORK_OR_SERVER_ERROR"

        "WS_CONNECTED" -> "STOPPING"
        "WS_CONNECTED" -> "WS_CONNECTION_ERROR"
        "WS_CONNECTED" -> "AUTHENTICATING"
        "WS_CONNECTED" -> "NETWORK_OR_SERVER_ERROR"

        "WS_CONNECTION_ERROR" -> "STOPPING"
        "WS_CONNECTION_ERROR" -> "AUTHENTICATING"
        "WS_CONNECTION_ERROR" -> "NETWORK_OR_SERVER_ERROR"
        "WS_CONNECTION_ERROR" -> "WS_CONNECTING"

        "STOPPING" -> "STOPPED"

        "AUTHENTICATED" -> "STOPPING"
        "AUTHENTICATED" -> "AUTHENTICATING"
        "AUTHENTICATED" -> "NETWORK_OR_SERVER_ERROR"
        "AUTHENTICATED" -> "WS_CONNECTING"
    }
*/
