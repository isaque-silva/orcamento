import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ConnectionStatus from '../components/ConnectionStatus';
import { FiLogOut } from 'react-icons/fi';

interface ConfiguracaoSupabase {
  url: string;
  anon_key: string;
}

const Configuracoes = () => {
  const [config, setConfig] = useState<ConfiguracaoSupabase>({
    url: '',
    anon_key: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDesconectando, setIsDesconectando] = useState(false);
  const [forceCheck, setForceCheck] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const toast = useToast();

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      // Carregar configurações do localStorage
      const url = localStorage.getItem('supabaseUrl');
      const anon_key = localStorage.getItem('supabaseAnonKey');

      if (url && anon_key) {
        setConfig({ url, anon_key });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro ao carregar configurações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Salvar no localStorage
      localStorage.setItem('supabaseUrl', config.url);
      localStorage.setItem('supabaseAnonKey', config.anon_key);

      // Forçar verificação de conexão
      setForceCheck(prev => !prev);

      toast({
        title: 'Configurações salvas',
        description: 'Verificando conexão...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: 'Verifique as credenciais e tente novamente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDesconectar = () => {
    if (window.confirm('Tem certeza que deseja desconectar? Você precisará configurar as credenciais novamente.')) {
      setIsDesconectando(true);
      localStorage.removeItem('supabaseUrl');
      localStorage.removeItem('supabaseAnonKey');
      setConfig({ url: '', anon_key: '' });
      
      toast({
        title: 'Desconectado com sucesso',
        description: 'As credenciais foram removidas',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Pequeno delay para garantir que a UI atualize corretamente
      setTimeout(() => {
        setIsDesconectando(false);
      }, 100);
    }
  };

  const handleStatusChange = (status: 'connected' | 'disconnected') => {
    setConnectionStatus(status);
    if (status === 'connected') {
      toast({
        title: 'Conexão estabelecida',
        description: 'Conectado ao Supabase com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Box mb={8}>
        <Heading size="lg" fontWeight="medium" color="gray.700">
          Configurações
        </Heading>
        <Text color="gray.500" fontSize="sm" mt={1}>
          Configure as credenciais do Supabase para conexão com o banco de dados
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 8 }}>
        <Card variant="outline">
          <CardHeader>
            <Box mb={2}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                flexDirection={{ base: "column", sm: "row" }}
                gap={2}
              >
                <Heading size="md" color="gray.700">Credenciais do Supabase</Heading>
                <HStack spacing={2}>
                  {!isDesconectando && (
                    <ConnectionStatus 
                      onStatusChange={handleStatusChange}
                      forceCheck={forceCheck}
                    />
                  )}
                  {(config.url || config.anon_key) && (
                    <Button
                      leftIcon={<Icon as={FiLogOut} />}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      onClick={handleDesconectar}
                      isDisabled={isDesconectando}
                    >
                      Desconectar
                    </Button>
                  )}
                </HStack>
              </Box>
              <Text color="gray.500" fontSize="sm" mt={1}>
                Insira as credenciais do seu projeto no Supabase
              </Text>
            </Box>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel color="gray.700">URL do Projeto</FormLabel>
                  <Input
                    name="url"
                    value={config.url}
                    onChange={handleChange}
                    placeholder="https://seu-projeto.supabase.co"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700">Chave Anônima</FormLabel>
                  <Input
                    name="anon_key"
                    value={config.anon_key}
                    onChange={handleChange}
                    type="password"
                    placeholder="sua-chave-anonima"
                  />
                </FormControl>

                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  size="lg"
                  w={{ base: "100%", md: "auto" }}
                >
                  Salvar Configurações
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading size="md" color="gray.700">Ajuda</Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Como encontrar suas credenciais
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600">
                1. Acesse o painel do Supabase e selecione seu projeto
              </Text>
              <Text color="gray.600">
                2. Na barra lateral, clique em "Project Settings"
              </Text>
              <Text color="gray.600">
                3. Na seção "API", você encontrará:
                <Box as="ul" pl={4} mt={2}>
                  <Box as="li" mb={2}>Project URL (URL do Projeto)</Box>
                  <Box as="li">anon public (Chave Anônima)</Box>
                </Box>
              </Text>
              <Text color="gray.600">
                4. Copie e cole essas informações nos campos ao lado
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading size="md" color="gray.700">Estrutura do Banco de Dados</Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Comandos SQL para criar as tabelas no Supabase
            </Text>
          </CardHeader>
          <CardBody>
            <Accordion allowMultiple>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Tabela: informacoes_empresa
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.50" borderRadius="md">
                  <Code display="block" whiteSpace="pre" p={4} overflowX="auto">
{`CREATE TABLE informacoes_empresa (
  id SERIAL PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('cpf', 'cnpj')),
  documento TEXT NOT NULL,
  endereco TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT,
  assinatura_url TEXT,
  observacoes_padrao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON informacoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);`}
                  </Code>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Tabela: clientes
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.50" borderRadius="md">
                  <Code display="block" whiteSpace="pre" p={4} overflowX="auto">
{`CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('cpf', 'cnpj')),
  documento TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);`}
                  </Code>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Tabela: orcamentos
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.50" borderRadius="md">
                  <Code display="block" whiteSpace="pre" p={4} overflowX="auto">
{`CREATE TABLE orcamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data DATE NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);`}
                  </Code>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Tabela: itens_orcamento
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.50" borderRadius="md">
                  <Code display="block" whiteSpace="pre" p={4} overflowX="auto">
{`CREATE TABLE itens_orcamento (
  id SERIAL PRIMARY KEY,
  orcamento_id INTEGER NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON itens_orcamento
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);

-- Função para calcular o valor total do orçamento
CREATE OR REPLACE FUNCTION calcular_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orcamentos
  SET valor_total = (
    SELECT COALESCE(SUM(quantidade * valor_unitario), 0)
    FROM itens_orcamento
    WHERE orcamento_id = NEW.orcamento_id
  )
  WHERE id = NEW.orcamento_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar o valor total do orçamento
CREATE TRIGGER atualizar_valor_total_insert
  AFTER INSERT ON itens_orcamento
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total();

CREATE TRIGGER atualizar_valor_total_update
  AFTER UPDATE ON itens_orcamento
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total();

CREATE TRIGGER atualizar_valor_total_delete
  AFTER DELETE ON itens_orcamento
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_total();`}
                  </Code>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Extensão moddatetime
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} bg="gray.50" borderRadius="md">
                  <Text mb={4} color="gray.600">
                    Antes de criar as tabelas, é necessário habilitar a extensão moddatetime para gerenciar automaticamente o campo updated_at:
                  </Text>
                  <Code display="block" whiteSpace="pre" p={4} overflowX="auto">
{`CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA public;`}
                  </Code>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Configuracoes; 