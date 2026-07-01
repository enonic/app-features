<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>

    <xsl:template match="/root">
        <div class="xslt-escape">
            <h2 class="xslt-escape-title">
                <xsl:value-of select="title"/>
            </h2>
            <ul class="xslt-escape-samples">
                <xsl:for-each select="samples/item">
                    <li class="xslt-escape-sample">
                        <span class="xslt-escape-label"><xsl:value-of select="label"/></span>
                        <xsl:text>: </xsl:text>
                        <code class="xslt-escape-raw"><xsl:value-of select="value"/></code>
                    </li>
                </xsl:for-each>
            </ul>
        </div>
    </xsl:template>
</xsl:stylesheet>
