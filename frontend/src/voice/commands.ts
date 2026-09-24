import { api } from '../net/api';
import { useSpotterStore } from '../store/spotter';
import { VoiceReply } from '../net/types';

export async function handleCommand(text: string) {
  if (!text.trim()) return;
  
  try {
    const response = await api.voiceCommand(text) as VoiceReply;
    const store = useSpotterStore.getState();
    
    // Store handles voice state partly, but we map UI actions here
    if (response.ui_actions) {
      response.ui_actions.forEach(action => {
        switch (action.type) {
          case 'open_training':
            store.setTrainingSheetOpen(true);
            break;
          case 'open_incidents':
            store.setIncidentSheetOpen(true);
            break;
          case 'open_insights':
            store.setInsightsSheetOpen(true);
            break;
          case 'ack_alert':
            if (action.payload && action.payload.alert_id) {
              store.ackAlert(action.payload.alert_id as string);
            }
            break;
        }
      });
    }
    
    return response;
  } catch (err) {
    console.error('Voice command failed', err);
    return null;
  }
}
