import { json } from "@remix-run/node";

import type { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/build/ts/server/clients";
import type { Product, ProductsResponse} from "../interfaces/product";

/**
 * generates a random product with a random color and price
 * @param admin Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request
 * @returns a new generated Product
 */
export const generateRandomProduct = async (admin: AdminApiContext) => {
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data?.productCreate?.product,
  });
}

/**
 * deletes all products in the Shopify store.
 * @param admin Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request
 * @returns the last deleted Product
 */
export const deleteAllProducts = async (admin: AdminApiContext ) => {
  const response:ProductsResponse = {products: [], hasNextPage: true};
  const firstResponse = await getFirstProduct(admin);

  if(firstResponse.endCursor) {
    response.products.push(...firstResponse.products);
    response.endCursor = firstResponse.endCursor;
  
    while(response.hasNextPage)   {
      const nextResponse = await getNextPageProducts(admin, response.endCursor);
      response.products.push(...nextResponse.products);
      response.hasNextPage = nextResponse.hasNextPage;
      response.endCursor = nextResponse.endCursor;
    }
    let deletedProduct: Product = {id: response.products[0].id, handle: response.products[0].handle};
    for(let product of response.products) {
      deletedProduct = await deleteProduct(admin, product);
    }
  
    return json({
      deletedProduct: deletedProduct,
    })
  } else {
    return json({
      deleteProduct: {id: '', handle: ''}
    })
  }
}


/**
 * retrieves the first product from the Shopify store using the Shopify Admin API
 * @param admin Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request
 * @returns products, endCursor, hasNextPage 
 */
export const getFirstProduct = async (admin: AdminApiContext): Promise<ProductsResponse>  => {
  const response = await admin.graphql(
    `#graphql
      query {
        products(first:1) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            handle
          }
        }
      }`
  )
  
  const responseJson = await response.json();
  console.log('getFirst', responseJson.data?.products?.pageInfo);
  return {
    products: responseJson.data?.products.nodes,
    endCursor: responseJson.data?.products?.pageInfo?.endCursor || undefined,
    hasNextPage: responseJson.data?.products?.pageInfo?.hasNextPage 
  }
}

/**
 * retrieves the next page of products from the Shopify store using the Shopify Admin API
 * @param admin Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request
 * @param endCursor the cursor corresponding to the last node in edges
 * @returns products, endCursor, hasNextPage
 */
export const getNextPageProducts = async (admin: AdminApiContext, endCursor: string | undefined): Promise<ProductsResponse> => {
  
  const response = await admin.graphql(
    `#graphql
      query($endCursor: String!) {
        products(first:25, after:$endCursor) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            handle
          }
        }
      }`,
      {
        variables: {
          endCursor: endCursor
        }
      }
  );

  const responseJson = await response.json();
  
  return {
    products: responseJson.data?.products.nodes,
    endCursor: responseJson.data?.products?.pageInfo?.endCursor,
    hasNextPage: responseJson.data?.products?.pageInfo?.hasNextPage
  }
}

/**
 * delete a product by product id
 * @param admin Methods for interacting with the GraphQL / REST Admin APIs for the store that made the request
 * @param product product info with id and handle to be deleted
 * @returns deleted product info
 */
export const deleteProduct = async (admin: AdminApiContext, product: Product): Promise<Product>  => {
  const response = await admin.graphql(
    `#graphql
      mutation deleteProduct($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
        }
      }`,
    {
      variables: {
        input: {
          id: product.id
        }
      }
    }
  );
  
  const responseJson = await response.json();

  return {
    id:responseJson.data?.productDelete?.deletedProductId,
    handle: product.handle
  }
}
