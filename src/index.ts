import WindowPosition from './position';
import Settings from './settings';
import EditBufferNotifications from './editbuffer';
import PTY from './pty'
import Shell from './shell'
import Keybindings from './keybindings'

// @ts-ignore
window.f =  { WindowPosition, Settings, EditBufferNotifications, PTY, Shell, Keybindings}

export * from "./fig";
export { WindowPosition, Settings, EditBufferNotifications, PTY, Shell, Keybindings}
