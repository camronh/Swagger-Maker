const { v4: uuid } = require("uuid");
const ethers = require("ethers");

function makeOAS(state) {
  const { title, version, server, hasAuth, auth, endpoints } = state;
  console.log({ title, version, server, hasAuth, auth, endpoints });
  let oas = {
    openapi: "3.0.1",
    info: {
      title,
    },
    servers: [{ url: server }],
    paths: {},
  };
  if (version) oas.info.version = version;
  for (let endpoint of endpoints) {
    let params = endpoint.params.map(param => {
      return {
        name: param.name,
        in: param.in,
        required: false,
        style: "form",
        explode: true,
        schema: {
          type: "string",
        },
      };
    });

    let path = {
      [endpoint.path]: {
        [endpoint.method]: {
          description: "API Endpoint",
          parameters: params,
          responses: {
            "200": {
              description: "Auto generated using Swagger Maker",
              content: {
                "application/json;charset=utf-8": {
                  schema: {
                    type: "string",
                  },
                  examples: {},
                },
              },
            },
          },
        },
      },
    };

    oas.paths[endpoint.path] = path[endpoint.path];
  }

  if (hasAuth) {
    oas.components = {
      securitySchemes: {
        key: {
          type: auth.type,
          name: auth.name,
          in: auth.in,
        },
      },
    };
  }
  console.log({ oas });
  return JSON.stringify(oas, null, 2);
}

function makeConfig(state) {
  const { title, endpoints, server, hasAuth, auth, version } = state;

  let config = {
    id: uuid(),
    nodeSettings: {
      nodeVersion: "0.1.0",
      cloudProvider: "aws",
      region: "us-east-1",
      stage: "Staging",
      logFormat: "json",
      chains: [
        {
          id: "4",
          type: "evm",
          providers: [
            {
              name: "rinkeby-alchemy",
              url: "https://rinkeby.infura.io/v3/{ FILL }",
            },
          ],
          contracts: {
            Airnode: "0xF9C39ec11055508BddA0Bc2a0234aBbbC09a3DeC",
            Convenience: "0xC9fb36DfAE95AD52E32ad48CCe9A1A169EfFaC6E",
          },
          providerAdminForRecordCreation:
            "0xC22376E2Dd4537D78F088B349Cbf2b9Ce79Fe016",
        },
      ],
    },
    triggers: {
      request: [],
    },
    ois: [],
  };

  config.triggers.request = endpoints.map(endpoint => {
    const endpointId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string"],
        [`${title}/${endpoint.path}`]
      )
    );
    return {
      endpointId,
      endpointName: endpoint.path,
      oisTitle: title,
    };
  });

  config.ois[0] = {
    oisFormat: "1.0.0",
    title,
    version,
    apiSpecifications: {
      servers: [
        {
          url: server,
        },
      ],
      security: {},
      components: {
        securitySchemes: {},
      },
      paths: {},
    },
  };

  if (hasAuth) {
    config.ois[0].apiSpecifications.security[`${title}Auth`] = [];
    config.ois[0].apiSpecifications.components.securitySchemes[
      `${title}Auth`
    ] = {
      type: auth.type,
      name: auth.name,
      in: auth.in,
    };
  }

  for (let endpoint of endpoints) {
    config.ois[0].apiSpecifications.paths[endpoint.path] = {
      [endpoint.method]: {
        parameters: endpoint.params.map(param => {
          return {
            name: param.name,
            in: param.in,
          };
        }),
      },
    };
  }
  config.ois[0].endpoints = endpoints.map(endpoint => {
    return {
      name: endpoint.path,
      operation: {
        method: endpoint.method,
        path: endpoint.path,
      },
      reservedParameters: [
        {
          name: "_type",
          fixed: "{ FILL }",
        },
        {
          name: "_path",
          fixed: "{ FILL }",
        },
      ],
      parameters: endpoint.params.map(param => {
        return {
          name: param.name,
          operationParameter: {
            name: param.name,
            in: param.in,
          },
        };
      }),
    };
  });

  //   remove duplicate endpointId from config.triggers.request
  config.triggers.request = config.triggers.request.filter(
    (item, index, self) => self.indexOf(item) === index
  );

  return JSON.stringify(config, null, 2);
}

module.exports = {
  makeOAS,
  makeConfig,
};