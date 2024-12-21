Server: https://github.com/lucasvanmol/latex-ocr-server
Client: https://github.com/lucasvanmol/obsidian-latex-ocr

Install the protoc: https://github.com/protocolbuffers/protobuf/releases
Set the user environment path

```
protoc --plugin=protoc-gen-ts_proto=".\\node_modules\\.bin\\protoc-gen-ts_proto.cmd" --ts_proto_out=. ./src/client/latex_ocr/protos/latex_ocr.proto --ts_proto_opt=outputServices=grpc-js
```
