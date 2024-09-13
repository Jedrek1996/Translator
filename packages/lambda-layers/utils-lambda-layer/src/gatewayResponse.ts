import * as lambda from "aws-lambda";

const createGatewayResponse = ({
  statusCode,
  body,
}: {
  statusCode: number;
  body: string;
}): lambda.APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body,
  };
};

export const createSuccessJsonResponse = (body: object) => {
  return createGatewayResponse({
    statusCode: 200,
    body: JSON.stringify(body),
  });
};
export const createErrorJsonResponse = (body: object) => {
  return createGatewayResponse({
    statusCode: 500,
    body: JSON.stringify(body),
  });
};
