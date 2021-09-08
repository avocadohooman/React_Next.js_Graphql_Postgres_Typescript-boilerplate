import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import theme from '../theme';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';


const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include' as const,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}> 
    <ChakraProvider resetCSS theme={theme}>
      <ColorModeProvider
        options={{
          useSystemColorMode: true,
        }}
      >
        <Component {...pageProps} />
      </ColorModeProvider>
    </ChakraProvider>
    </ApolloProvider>
  )
}

export default MyApp
