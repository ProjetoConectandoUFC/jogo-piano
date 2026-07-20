// Camada fina sobre a Web MIDI API. Emite eventos onNoteOn / onNoteOff / onStatusChange
// e registra cada mensagem MIDI bruta no observador (debug.js).
// Observadores externos podem se inscrever para receber notificações de mudança de estado
import { dlog, midiName } from './debug.js';
// Observadores externos podem se inscrever para receber notificações de mudança de estado
const handlers = {
  noteOn: [],
  noteOff: [],
  status: [],
};
// Estado de acesso à API MIDI e lista de entradas ativas
let access = null;
let activeInputs = [];
// Função auxiliar para emitir eventos para todos os observadores inscritos
function emit(kind, payload) {
  for (const h of handlers[kind]) h(payload);
}
// Função para atualizar a lista de entradas MIDI ativas, configurando os manipuladores de eventos e emitindo o status atual
function refreshInputs() {
  if (!access) return;
  for (const input of activeInputs) input.onmidimessage = null;
  activeInputs = [...access.inputs.values()];
  for (const input of activeInputs) {
    input.onmidimessage = onMidiMessage;
    dlog('info', `Entrada MIDI: ${input.name} (state=${input.state})`);
  }
  emit('status', {
    connected: activeInputs.length > 0,
    deviceName: activeInputs[0]?.name ?? null,
  });
}
// Função para lidar com mensagens MIDI recebidas, registrando eventos de NoteOn e NoteOff, e ignorando outros tipos de mensagens
function onMidiMessage(ev) {
  const [status, data1, data2] = ev.data;
  const cmd = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  if (cmd === 0x90 && data2 > 0) {
    dlog('midi', `MIDI ch${channel} NoteOn  ${midiName(data1)} (#${data1}) vel=${data2}`);
    emit('noteOn', { midi: data1, velocity: data2, time: performance.now() });
  } else if (cmd === 0x80 || (cmd === 0x90 && data2 === 0)) {
    dlog('midi-off', `MIDI ch${channel} NoteOff ${midiName(data1)} (#${data1})`);
    emit('noteOff', { midi: data1, time: performance.now() });
  } else {
    dlog('ignored', `MIDI ch${channel} status=0x${status.toString(16)} d1=${data1} d2=${data2} (ignorado)`);
  }
}
// Função para inicializar o acesso à API Web MIDI, configurando os manipuladores de eventos e emitindo o status atual
export async function initMidi() {
  if (!navigator.requestMIDIAccess) {
    dlog('err', 'Web MIDI não suportado neste runtime.');
    emit('status', { connected: false, deviceName: null, error: 'Web MIDI não suportado' });
    return;
  }
  try {
    access = await navigator.requestMIDIAccess({ sysex: false });
    dlog('info', `requestMIDIAccess OK — ${access.inputs.size} entrada(s)`);
    access.onstatechange = (e) => {
      dlog('info', `state-change: ${e.port?.name ?? '?'} = ${e.port?.state}`);
      refreshInputs();
    };
    refreshInputs();
  } catch (err) {
    dlog('err', `Falha em requestMIDIAccess: ${err}`);
    emit('status', { connected: false, deviceName: null, error: String(err) });
  }
}
// Função para permitir que observadores externos se inscrevam para receber notificações de eventos MIDI, incluindo NoteOn, NoteOff e mudanças de status
export function on(eventName, handler) {
  const list = handlers[eventName === 'noteOn' ? 'noteOn'
    : eventName === 'noteOff' ? 'noteOff' : 'status'];
  list.push(handler);
}
