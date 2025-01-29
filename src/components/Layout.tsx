import {
  Box,
  Flex,
  Stack,
  Icon,
  Text,
  Link,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import { FiHome, FiFileText, FiUsers, FiInfo, FiDatabase, FiMenu } from 'react-icons/fi';

const Layout = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const menuItems = [
    {
      label: 'Dashboard',
      icon: FiHome,
      path: '/'
    },
    {
      label: 'Orçamentos',
      icon: FiFileText,
      path: '/orcamentos'
    },
    {
      label: 'Clientes',
      icon: FiUsers,
      path: '/clientes'
    },
    {
      label: 'Informações',
      icon: FiInfo,
      path: '/informacoes-empresa'
    },
    {
      label: 'Configurações',
      icon: FiDatabase,
      path: '/configuracoes'
    }
  ];

  const MenuContent = () => (
    <Stack spacing={1}>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          as={RouterLink}
          to={item.path}
          textDecoration="none"
          _hover={{ textDecoration: 'none' }}
          onClick={isMobile ? onClose : undefined}
        >
          <Flex
            align="center"
            p={3}
            mx={3}
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={location.pathname === item.path ? 'brand.50' : 'transparent'}
            color={location.pathname === item.path ? 'brand.500' : 'gray.600'}
            _hover={{
              bg: 'brand.50',
              color: 'brand.500',
            }}
          >
            <Icon
              as={item.icon}
              mr={4}
              fontSize="16"
            />
            <Text fontSize="sm" fontWeight="medium">
              {item.label}
            </Text>
          </Flex>
        </Link>
      ))}
    </Stack>
  );

  return (
    <Flex w="100vw" h="100vh" overflow="hidden">
      {/* Menu Mobile */}
      {isMobile && (
        <Box
          bg="white"
          px={4}
          py={2}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={999}
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              Sistema de Orçamentos
            </Text>
            <IconButton
              aria-label="Abrir menu"
              icon={<FiMenu />}
              variant="ghost"
              onClick={onOpen}
            />
          </Flex>
        </Box>
      )}

      {/* Sidebar Desktop */}
      {!isMobile && (
        <Box
          w="250px"
          bg="white"
          borderRight="1px"
          borderColor="gray.200"
          h="100vh"
          position="fixed"
          left={0}
          top={0}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '24px',
            },
          }}
        >
          <Box p={5}>
            <Text fontSize="lg" fontWeight="bold" color="brand.500" mb={8}>
              Sistema de Orçamentos
            </Text>
            <MenuContent />
          </Box>
        </Box>
      )}

      {/* Drawer Mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody p={0} mt={4}>
            <MenuContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        flex={1}
        bg="gray.50"
        ml={isMobile ? 0 : "250px"}
        w={isMobile ? "100%" : "calc(100vw - 250px)"}
        minH="100vh"
        overflowY="auto"
        position="relative"
        pt={isMobile ? "60px" : 0}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '24px',
          },
        }}
      >
        <Outlet />
      </Box>
    </Flex>
  );
}

export default Layout; 