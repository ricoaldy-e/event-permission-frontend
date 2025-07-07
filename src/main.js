import { createApp, h } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

import "./assets/css/main.css";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const pinia = createPinia();

const httpLink = createHttpLink({
  uri: "https://desk.apps.undip.ac.id/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("jwt_token");

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    if (networkError.statusCode === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
    }
  }
});

const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

const app = createApp({
  setup() {
    provideApolloClient(apolloClient);
  },
  render: () => h(App),
});

app.use(pinia);

app.use(router);

app.mount("#app");
