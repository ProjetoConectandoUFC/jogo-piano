// Importa os módulos necessários do Electron e do Node.js, incluindo app, BrowserWindow e session para criar a janela do aplicativo e gerenciar permissões, e path para manipulação de caminhos de arquivos
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
// Função para criar a janela principal do aplicativo, definindo dimensões, cores, título e preferências da web
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#0b0b14',
    title: 'Genius no Piano',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'src', 'preload.js'),
    },
  });
  win.loadFile('index.html');
}
// Configura o aplicativo para criar a janela quando estiver pronto, e define manipuladores de permissão para permitir acesso a MIDI e SysEx, enquanto nega outras permissões
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'midi' || permission === 'midiSysex') return callback(true);
    callback(false);
  });
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'midi' || permission === 'midiSysex') return true;
    return false;
  });
  createWindow();
// Configura o aplicativo para criar uma nova janela se não houver janelas abertas (comportamento específico do macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
// Configura o aplicativo para encerrar quando todas as janelas forem fechadas, exceto no macOS, onde é comum manter o aplicativo ativo até que o usuário saia explicitamente
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
