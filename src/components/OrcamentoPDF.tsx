import { Box, useBreakpointValue, Spinner, Center } from '@chakra-ui/react';
import { Cliente, Orcamento, InformacoesEmpresa } from '../types';
import { lazy, Suspense } from 'react';

const OrcamentoPDFRenderer = lazy(() => import('./OrcamentoPDFRenderer'));

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  cliente: Cliente;
  informacoesEmpresa: InformacoesEmpresa;
}

const OrcamentoPDF = ({ orcamento, cliente, informacoesEmpresa }: OrcamentoPDFProps) => {
  const pdfHeight = useBreakpointValue({ 
    base: "calc(100vh - 120px)", 
    md: "calc(100vh - 150px)",
    lg: "calc(100vh - 180px)" 
  });

  return (
    <Box 
      w="100%" 
      h={pdfHeight}
      bg="white" 
      overflow="hidden"
      position="relative"
    >
      <Suspense 
        fallback={
          <Center h="100%">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand.500"
              size="xl"
            />
          </Center>
        }
      >
        <OrcamentoPDFRenderer
          orcamento={orcamento}
          cliente={cliente}
          informacoesEmpresa={informacoesEmpresa}
          pdfHeight={pdfHeight}
        />
      </Suspense>
    </Box>
  );
};

export default OrcamentoPDF; 