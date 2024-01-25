import {
  Card,
  Button,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";

const DeleteProduct = (props: any) => {
  return (
    <Card>
      <BlockStack gap="500">
        <InlineStack gap="300">
          <Button loading={props.isLoading} onClick={props.deleteProduct}>
            Delete all products
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  )
}

export default DeleteProduct;