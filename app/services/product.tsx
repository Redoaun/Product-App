import { json } from "@remix-run/node";

import type { Product, ProductsResponse} from "../interfaces/product";

export const generateRandomProduct = async (admin: any) => {
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

export const deleteAllProducts = async (admin: any ) => {
  const response:ProductsResponse = {products: [], hasNextPage: true};
  const firstResponse = await getFirstProduct(admin);
  response.products.push(...firstResponse.products);
  response.endCursor = firstResponse.endCursor;
  while(response.hasNextPage)   {
    const nextResponse = await getNextPageProducts(admin, response.endCursor);
    response.products.push(...nextResponse.products);
    response.hasNextPage = nextResponse.hasNextPage;
    response.endCursor = nextResponse.endCursor;
  }
  console.log(response);
  let deletedProduct: Product = {id: response.products[0].id, handle: response.products[0].handle};
  for(let product of response.products) {
    deletedProduct = await deleteProduct(admin, product);
  }

  return json({
    deletedProduct: deletedProduct,
  })
}

export const getFirstProduct = async (admin: any): Promise<ProductsResponse>  => {
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
  return {
    products: responseJson.data?.products.nodes,
    endCursor: responseJson.data?.products?.pageInfo?.endCursor,
    hasNextPage: responseJson.data?.products?.pageInfo?.hasNextPage
  }
}

export const getNextPageProducts = async (admin: any, endCursor: any): Promise<ProductsResponse> => {
  
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

export const deleteProduct = async (admin: any, product: Product): Promise<Product>  => {
  console.log('product: ', product);
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
  console.log(responseJson);

  return {
    id:responseJson.data?.productDelete?.deletedProductId,
    handle: product.handle
  }
}
