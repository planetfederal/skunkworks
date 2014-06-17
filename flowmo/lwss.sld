<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" 
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <!-- a named layer is the basic building block of an sld document -->


    <!-- [@scale > 500000000] /* Zoom 1 */
    [@scale > 220000000][@scale < 500000000] /* Zoom 2 */
    [@scale > 100000000][@scale < 220000000] /* Zoom 3 */
    [@scale > 50000000][@scale < 100000000] /* Zoom 4 */
    [@scale > 25000000][@scale < 50000000] /* Zoom 5 */
    [@scale > 14000000][@scale < 25000000] /* Zoom 6 */
    [@scale > 6000000][@scale < 14000000] /* Zoom 7 */
    [@scale > 3000000][@scale < 6000000] /* Zoom 8 */
    [@scale > 1500000][@scale < 3000000] /* Zoom 9 */
    [@scale > 800000][@scale < 1500000] /* Zoom 10 */
    [@scale > 350000][@scale < 800000] /* Zoom 12 */
    [@scale > 220000][@scale < 350000] /* Zoom 12 */
    [@scale > 100000][@scale < 220000] /* Zoom 13 */
    [@scale > 50000][@scale < 100000] /* Zoom 14 */
    [@scale > 28000][@scale < 50000] /* Zoom 15 */
    [@scale > 10000][@scale < 28000] /* Zoom 16 */
    [@scale > 5000][@scale < 10000 /* Zoom 17 */
    [@scale < 5000]
    -->

  <NamedLayer>
    <Name>Rivers</Name>
    <UserStyle>
        <!-- they have names, titles and abstracts -->
      
      <Title>Rivers and Streams</Title>
      <Abstract>A scale-dependent (web mercator) style for WSA rivers</Abstract>
      <!-- FeatureTypeStyles describe how to render different features -->

      <FeatureTypeStyle>
        <!--FeatureTypeName>Feature</FeatureTypeName-->

        <!-- Zoom 8+ -->
        <Rule>

          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>4</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>

          <MinScaleDenominator>3000000</MinScaleDenominator>

          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">0.2</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>

        </Rule>

        <!-- Zoom 9 -->
        <Rule>

          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>3</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>

          <MinScaleDenominator>1500000</MinScaleDenominator>
          <MaxScaleDenominator>3000000</MaxScaleDenominator>


          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">0.2</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>

        </Rule>


        <!-- Zoom 10 -->
        <Rule>
          
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>3</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          
          <MinScaleDenominator>800000</MinScaleDenominator>
          <MaxScaleDenominator>1500000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">0.4</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

        <!-- Zoom 11 -->
        <Rule>
          
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>2</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          
          <MinScaleDenominator>350000</MinScaleDenominator>
          <MaxScaleDenominator>800000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">0.8</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

        <!-- Zoom 12 -->
        <Rule>
          
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>2</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          
          <MinScaleDenominator>220000</MinScaleDenominator>
          <MaxScaleDenominator>350000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">1</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>

        <!-- Zoom 13 -->
        <Rule>
          
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>2</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          
          <MinScaleDenominator>100000</MinScaleDenominator>
          <MaxScaleDenominator>220000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">1.5</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>gaze_name</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Dialog</CssParameter>
              <CssParameter name="font-size">10</CssParameter>
              <CssParameter name="font-style">italic</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>            
            <LabelPlacement>
              <LinePlacement />
            </LabelPlacement>
            <Halo>
              <Radius>3</Radius>
              <Fill>
                <CssParameter name="fill">#ddddff</CssParameter>
                <CssParameter name="fill-opacity">0.7</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#1122EE</CssParameter>
            </Fill>
            <VendorOption name="followLine">true</VendorOption>
            <VendorOption name="maxAngleDelta">90</VendorOption>
            <VendorOption name="maxDisplacement">400</VendorOption>
            <!-- <VendorOption name="repeat">150</VendorOption> -->
            <VendorOption name="group">yes</VendorOption>
          </TextSymbolizer>
          
        </Rule>

        <!-- Zoom 14 -->
        <Rule>
          
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>code</ogc:PropertyName>
                <ogc:Literal>1400</ogc:Literal>
              </ogc:PropertyIsNotEqualTo>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>l_order</ogc:PropertyName>
                <ogc:Literal>2</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          
          <MinScaleDenominator>50000</MinScaleDenominator>
          <MaxScaleDenominator>100000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>

          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>gaze_name</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Dialog</CssParameter>
              <CssParameter name="font-size">12</CssParameter>
              <CssParameter name="font-style">italic</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>            
            <LabelPlacement>
              <LinePlacement />
            </LabelPlacement>
            <Halo>
              <Radius>3</Radius>
              <Fill>
                <CssParameter name="fill">#ddddff</CssParameter>
                <CssParameter name="fill-opacity">0.7</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#1122EE</CssParameter>
            </Fill>
            <VendorOption name="followLine">true</VendorOption>
            <VendorOption name="maxAngleDelta">90</VendorOption>
            <VendorOption name="maxDisplacement">400</VendorOption>
            <!-- <VendorOption name="repeat">150</VendorOption> -->
            <VendorOption name="group">yes</VendorOption>
          </TextSymbolizer>


        </Rule>

        <!-- Zoom 15+ -->
        <Rule>
          
          <ogc:Filter>
            <ogc:PropertyIsNotEqualTo>
              <ogc:PropertyName>code</ogc:PropertyName>
              <ogc:Literal>1400</ogc:Literal>
            </ogc:PropertyIsNotEqualTo>
          </ogc:Filter>
          
          <MaxScaleDenominator>50000</MaxScaleDenominator>

          <!-- like a polygonsymbolizer -->
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#1122EE</CssParameter>
              <CssParameter name="stroke-width">3</CssParameter>
              <CssParameter name="stroke-linecap">round</CssParameter>
            </Stroke>
          </LineSymbolizer>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>gaze_name</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Dialog</CssParameter>
              <CssParameter name="font-size">14</CssParameter>
              <CssParameter name="font-style">italic</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>            
            <LabelPlacement>
              <LinePlacement />
            </LabelPlacement>
            <Halo>
              <Radius>3</Radius>
              <Fill>
                <CssParameter name="fill">#ddddff</CssParameter>
                <CssParameter name="fill-opacity">0.7</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#1122EE</CssParameter>
            </Fill>
            <VendorOption name="followLine">true</VendorOption>
            <VendorOption name="maxAngleDelta">90</VendorOption>
            <VendorOption name="maxDisplacement">400</VendorOption>
            <!-- <VendorOption name="repeat">150</VendorOption> -->
            <VendorOption name="group">yes</VendorOption>
          </TextSymbolizer>
        </Rule>

        </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
