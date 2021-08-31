import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import { Provider, createClient, dedupExchange, fetchExchange} from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import theme from '../theme';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';


const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (result: LoginMutation, args, cache, info) => {
          cache.updateQuery({ query: MeDocument}, (data: MeQuery) => {
            if (result.login.errors) {
              return data;
            } else {
              return {
                me: result.login.user,
              }
            }
          });
        },
        register: (result: RegisterMutation, args, cache, info) => {
          cache.updateQuery({ query: MeDocument}, (data: MeQuery) => {
            if (result.register.errors) {
              return data;
            } else {
              return {
                me: result.register.user,
              }
            }
          });
        }
      }
    }
  }), fetchExchange],
  
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
