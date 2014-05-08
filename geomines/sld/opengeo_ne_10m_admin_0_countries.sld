<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <NamedLayer>
    <Name>ne_10m_admin_0_countries</Name>
    <UserStyle>
      <Title>A orange polygon style</Title>
      <FeatureTypeStyle>
        <Rule>
          <Title>orange polygon</Title>
          <PolygonSymbolizer>
              <Fill>
              <GraphicFill>
                  <Graphic>
                      <ExternalGraphic>
                          <OnlineResource xlink:href="file:stone-pattern.jpg" xlink:type="simple"/>
                          <Format>image/jpeg</Format>
                      </ExternalGraphic>
                  </Graphic>
              </GraphicFill>
         </Fill>
        <!--    <Stroke>
              <CssParameter name="stroke">#eec037</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
            </Stroke> -->
          </PolygonSymbolizer>

        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>