import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Link,
  InlineStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

import GenerateProduct from "../components/products/GenerateProduct";
import DeleteProduct from "../components/products/DeleteProduct";

import { generateRandomProduct, deleteAllProducts } from "../services/product"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const [formData] = await Promise.all([request.formData()]);
  const actionType = formData.get('actionType');

  console.log('actionType: ', actionType);
  console.log('session:', session);
  switch(actionType) {
    case 'generate':
      const product = await generateRandomProduct(admin);
      return product;
    case 'delete':
      const response = await deleteAllProducts(admin);
      return response;
    default:
      return json({product: "gid://shopify/ProductVariant/44749229326502"});
  }
};

export default function Index() {
  const nav = useNavigation();
  const actionData:any = useActionData<typeof action>();
  const submit = useSubmit();
  const isGenerating =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const isDeleting =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "DELETE";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );
  const deletedProductId = actionData?.deletedProduct?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);
  useEffect(() => {
    if (deletedProductId) {
      shopify.toast.show("All Products deleted");
    }
  }, [deletedProductId]);
  const generateProduct = () => submit({actionType: 'generate'}, { replace: true, method: "POST" });
  const deleteProduct = () => submit({actionType: 'delete'}, { replace: true, method: "DELETE" });

  return (
    <Page>
      <ui-title-bar title="Generate / Delete Products">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">
              <GenerateProduct 
                productId={productId} 
                isLoading={isGenerating} 
                actionData={actionData}
                generateProduct={generateProduct}
              />
              <DeleteProduct
                isLoading={isDeleting} 
                actionData={actionData}
                deleteProduct={deleteProduct}
              />
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    App template specs
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Framework
                      </Text>
                      <Link
                        url="https://remix.run"
                        target="_blank"
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        url="https://www.prisma.io/"
                        target="_blank"
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Interface
                      </Text>
                      <span>
                        <Link
                          url="https://polaris.shopify.com"
                          target="_blank"
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        API
                      </Text>
                      <Link
                        url="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
