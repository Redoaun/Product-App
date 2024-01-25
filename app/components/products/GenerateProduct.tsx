import { useEffect } from "react";
import {
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
} from "@shopify/polaris";

const GenerateProduct = (props: any) => {
  useEffect(() => {
    if (props.productId) {
      shopify.toast.show("Product created");
    }
  }, [props.productId]);
  return (
    <Card>
      <BlockStack gap="500">
        <InlineStack gap="300">
          <Button loading={props.isLoading} onClick={props.generateProduct}>
            Generate a product
          </Button>
          {props.actionData?.product && (
            <Button
              url={`shopify:admin/products/${props.productId}`}
              target="_blank"
              variant="plain"
            >
              View product
            </Button>
          )}
        </InlineStack>
        {props.actionData?.product && (
          <Box
            padding="400"
            background="bg-surface-active"
            borderWidth="025"
            borderRadius="200"
            borderColor="border"
            overflowX="scroll"
          >
            <pre style={{ margin: 0 }}>
              <code>{JSON.stringify(props.actionData.product, null, 2)}</code>
            </pre>
          </Box>
        )}
      </BlockStack>
    </Card>
  )

}

export default GenerateProduct;