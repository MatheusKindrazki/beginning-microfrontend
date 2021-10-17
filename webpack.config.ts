import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";
import dotenv from "dotenv";

import { dependencies as deps } from './package.json';

import webpack, { Configuration } from "webpack";

dotenv.config();

const isDevelopment = process.env.NODE_ENV !== "production";

const PORT = process.env.PORT || 3000

const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost'

const projectURL = new URL(PUBLIC_URL)

projectURL.port = String(PORT)

interface WebpackConfig extends Configuration {
  devServer: {
    hot: boolean
    port: number | string
  }
}

const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;

const config: WebpackConfig  = {
  mode: isDevelopment ? "development" : "production",
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    publicPath: projectURL.toString()
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  devServer: {
    hot: true,
    port: PORT,
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new ModuleFederationPlugin({
      name: "@psdlab/core",
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {},
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
  ],
};

export default config;
