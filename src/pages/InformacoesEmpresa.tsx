import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Select,
  Textarea,
  Card,
  CardBody,
  Text,
  Image,
  SimpleGrid,
  Icon,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { InformacoesEmpresa } from '../types';
import { FiSave } from 'react-icons/fi';

interface InformacoesEmpresaForm {
  nome_empresa: string;
  tipo_documento: 'cpf' | 'cnpj';
  documento: string;
  email: string;
  telefone: string;
  endereco: string;
  logo_url?: string;
  assinatura_url?: string;
  observacoes_padrao?: string;
}

const InformacoesEmpresaPage = () => {
  const { register, handleSubmit, reset } = useForm<InformacoesEmpresaForm>();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    carregarInformacoes();
  }, []);

  const carregarInformacoes = async () => {
    try {
      const client = supabase();
      const { data, error } = await client
        .from('informacoes_empresa')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
      toast({
        title: 'Erro ao carregar informações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: InformacoesEmpresaForm) => {
    try {
      const client = supabase();
      const { error } = await client
        .from('informacoes_empresa')
        .upsert([data], {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: 'Informações salvas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      carregarInformacoes();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar informações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" p={8} w="100%">
      <Heading size="lg" mb={8} color="gray.700">Informações da Empresa</Heading>

      <Card variant="outline" boxShadow="sm" w="100%">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <Input {...register('nome_empresa')} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select {...register('tipo_documento')}>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Documento</FormLabel>
                  <Input {...register('documento')} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" {...register('email')} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefone</FormLabel>
                  <Input {...register('telefone')} />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Endereço</FormLabel>
                  <Input {...register('endereco')} />
                </FormControl>

                <FormControl>
                  <FormLabel>URL da Logo</FormLabel>
                  <Input {...register('logo_url')} />
                </FormControl>

                <FormControl>
                  <FormLabel>URL da Assinatura</FormLabel>
                  <Input {...register('assinatura_url')} />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Observações Padrão</FormLabel>
                <Textarea
                  {...register('observacoes_padrao')}
                  placeholder="Estas observações aparecerão em todos os orçamentos"
                  rows={4}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                leftIcon={<Icon as={FiSave} />}
                isLoading={isLoading}
              >
                Salvar Informações
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default InformacoesEmpresaPage; 