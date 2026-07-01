<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>

    <xsl:template match="/root">
        <div class="xslt-list">
            <h2 class="xslt-list-title">
                <xsl:value-of select="title"/>
            </h2>
            <ul class="xslt-fruit-list">
                <xsl:for-each select="fruits/item">
                    <li>
                        <strong><xsl:value-of select="name"/></strong>
                        <xsl:text> — </xsl:text>
                        <span class="xslt-color"><xsl:value-of select="color"/></span>
                    </li>
                </xsl:for-each>
            </ul>
        </div>
    </xsl:template>
</xsl:stylesheet>
