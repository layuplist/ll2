import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Auth } from '@aws-amplify/auth';
import { createAuthLink, AuthOptions, AUTH_TYPE } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
} from '@apollo/client';

const config = {
  url: 'https://q3khmevtbremfeq2ywznpcgwl4.appsync-api.us-east-1.amazonaws.com/graphql',
  region: 'us-east-1',
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: () => Auth.currentCredentials()
  } as AuthOptions,
  disableOffline: true
};
const cache = new InMemoryCache();
const link = ApolloLink.from([createAuthLink(config), createSubscriptionHandshakeLink(config) as unknown as ApolloLink]);
const client = new ApolloClient({
  cache,
  link
});

Auth.configure({
  region: 'us-east-1',
  identityPoolId: 'us-east-1:f11a5e06-1590-41d8-8aea-e83821ab59b0'
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
