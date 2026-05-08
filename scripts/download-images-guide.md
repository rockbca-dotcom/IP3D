# Guia para Download de Imagens dos Produtos

## Instruções

Para cada produto, acesse o link do Alibaba, clique com botão direito na imagem principal e salve na pasta correspondente.

### Produtos e Links

| Produto | Pasta | Link Alibaba |
|---------|-------|--------------|
| Kit Hotend Bambu Lab A1 | `public/images/products/hotend-bambu-a1/` | [Link](https://www.alibaba.com/product-detail/Bambu-Lab-A1-Mini-Hotend-Kit_1601155184173.html) |
| Capa Silicone Bambu A1 | `public/images/products/silicone-bambu-a1/` | [Link](https://www.alibaba.com/product-detail/A1-Silicone-Sock-Covers-300C-High_1601023863763.html) |
| Bico Nozzle Aço Bambu A1 | `public/images/products/nozzle-bambu-a1/` | [Link](https://www.alibaba.com/product-detail/Hardened-Steel-Nozzles-for-Bambu-Lab_1601254442945.html) |
| Nozzle Wiper Bambu A1 | `public/images/products/wiper-bambu-a1/` | [Link](https://www.alibaba.com/product-detail/3D-Printer-Parts-Nozzle-Wiper-for_1601223384586.html) |
| Kit Termistor Bambu A1 | `public/images/products/termistor-bambu-a1/` | [Link](https://www.alibaba.com/product-detail/3D-Printer-Heater-Cartridge-and-NTC_1601279813881.html) |
| Mesa PEI H2D | `public/images/products/mesa-pei-h2d/` | [Link](https://www.alibaba.com/product-detail/355-X346mm-Build-Plate-for-Bambu_1601612107806.html) |
| Kit Aquecedor Cerâmico 60W | `public/images/products/aquecedor-ceramico/` | [Link](https://www.alibaba.com/product-detail/Ceramic-Heater-Thermistor-Kit-60W-360_1601161678770.html) |
| Kit Hotend Creality CR-10 | `public/images/products/hotend-creality-cr10/` | [Link](https://www.alibaba.com/product-detail/3D-Full-Metal-J-Head-CR10_1600663425800.html) |
| Termistor NTC 100K | `public/images/products/termistor-ntc/` | [Link](https://www.alibaba.com/product-detail/Thermistor-Upgrade-HT-NTC100K-Thermistor-3D_1601287310814.html) |

### Nomenclatura dos Arquivos

Salve a imagem principal como `main.jpg` em cada pasta.
Imagens adicionais podem ser salvas como `gallery-1.jpg`, `gallery-2.jpg`, etc.

### Após Baixar as Imagens

Execute o script de atualização:
```bash
node scripts/update-product-images.js
```
