<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>

    <xsl:template match="/root">
        <div class="xslt-detail">
            <h2 class="xslt-detail-title">
                <xsl:value-of select="title"/>
            </h2>
            <xsl:apply-templates select="fruits/item"/>
            <p class="xslt-detail-count">
                <xsl:text>Total: </xsl:text>
                <xsl:value-of select="count(fruits/item)"/>
            </p>
        </div>
    </xsl:template>

    <xsl:template match="item">
        <dl class="xslt-detail-item">
            <dt>Name</dt>
            <dd class="xslt-detail-name"><xsl:value-of select="name"/></dd>
            <dt>Color</dt>
            <dd class="xslt-detail-color"><xsl:value-of select="color"/></dd>
        </dl>
    </xsl:template>
</xsl:stylesheet>
