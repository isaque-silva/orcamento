import { Badge } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface ConnectionStatusProps {
  onStatusChange?: (status: 'connected' | 'disconnected') => void;
  forceCheck?: boolean;
}

const ConnectionStatus = ({ onStatusChange, forceCheck }: ConnectionStatusProps) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [shouldCheck, setShouldCheck] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const url = localStorage.getItem('supabaseUrl');
      const key = localStorage.getItem('supabaseAnonKey');

      if (!url || !key) {
        setStatus('disconnected');
        onStatusChange?.('disconnected');
        setShouldCheck(false);
        return;
      }

      const client = supabase();
      const { error } = await client.from('orcamentos').select('id').limit(1);

      const newStatus = error ? 'disconnected' : 'connected';
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      setStatus('disconnected');
      onStatusChange?.('disconnected');
    }
    setShouldCheck(false);
  }, [onStatusChange]);

  useEffect(() => {
    if (shouldCheck || forceCheck) {
      checkConnection();
    }

    const interval = setInterval(() => {
      if (status === 'connected') {
        setShouldCheck(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [shouldCheck, status, forceCheck, checkConnection]);

  useEffect(() => {
    if (forceCheck) {
      checkConnection();
    }
  }, [forceCheck, checkConnection]);

  if (status === 'checking' && shouldCheck) {
    return null;
  }

  return (
    <Badge
      colorScheme={status === 'connected' ? 'green' : 'red'}
      variant="subtle"
      px={2}
      py={1}
      borderRadius="full"
    >
      {status === 'connected' ? 'Conectado' : 'Desconectado'}
    </Badge>
  );
};

export default ConnectionStatus; 