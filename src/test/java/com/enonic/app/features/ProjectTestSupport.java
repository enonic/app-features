package com.enonic.app.features;

import java.io.File;
import java.io.FileReader;
import java.net.URL;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

import javax.xml.XMLConstants;
import javax.xml.transform.dom.DOMSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;

import org.junit.Before;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

import com.google.common.collect.Lists;

import junit.framework.Assert;

import com.enonic.xp.xml.DomHelper;
import com.enonic.xp.xml.schema.SchemaNamespaces;

public abstract class ProjectTestSupport
{
    private File rootDir;

    private boolean requireSiteXml = true;

    private boolean requireDescriptorXml = true;

    @Before
    public final void setup()
        throws Exception
    {
        this.rootDir = findSrcDir();
    }

    protected final void requireSiteXml( final boolean requireSiteXml )
    {
        this.requireSiteXml = requireSiteXml;
    }

    protected final void requireDescriptorXml( final boolean requireDescriptorXml )
    {
        this.requireDescriptorXml = requireDescriptorXml;
    }

    private File findSrcDir()
        throws Exception
    {
        final Enumeration<URL> urls = getClass().getClassLoader().getResources( "site" );
        while ( urls.hasMoreElements() )
        {
            final File dir = new File( urls.nextElement().getFile() );
            if ( dir.exists() && dir.getParentFile().getName().equals( "main" ) )
            {
                return dir;
            }
        }

        return null;
    }

    @Test
    public final void testSite()
        throws Exception
    {
        final File descriptor = new File( this.rootDir, "site.xml" );
        if ( this.requireSiteXml )
        {
            Assert.assertTrue( "Site decriptor not found (" + relativeFile( descriptor ) + ")", descriptor.isFile() );
        }

        validateXmlDescriptor( descriptor );
    }

    @Test
    public final void testPages()
        throws Exception
    {
        testControllers( "Page", new File( this.rootDir, "pages" ) );
    }

    @Test
    public final void testLayouts()
        throws Exception
    {
        testControllers( "Layout", new File( this.rootDir, "layouts" ) );
    }

    @Test
    public final void testParts()
        throws Exception
    {
        testControllers( "Part", new File( this.rootDir, "parts" ) );
    }

    private void testControllers( final String type, final File dir )
        throws Exception
    {
        for ( final File child : findDirs( dir ) )
        {
            testController( type, child );
        }
    }

    private void testController( final String type, final File dir )
        throws Exception
    {
        final String name = dir.getName();
        final File descriptor = new File( dir, name + ".xml" );

        if ( this.requireDescriptorXml )
        {
            Assert.assertTrue( type + " descriptor not found (" + relativeFile( descriptor ) + ")", descriptor.isFile() );
        }

        validateXmlDescriptor( descriptor );
    }

    private String relativeFile( final File file )
    {
        return file.getAbsolutePath().substring( this.rootDir.getAbsolutePath().length() + 1 );
    }

    private List<File> findDirs( final File dir )
    {
        final File[] children = dir.listFiles();
        if ( children == null )
        {
            return Collections.emptyList();
        }

        return Lists.newArrayList( children );
    }

    private void validateXmlDescriptor( final File file )
        throws Exception
    {
        if ( !file.isFile() )
        {
            return;
        }

        final SchemaFactory factory = SchemaFactory.newInstance( XMLConstants.W3C_XML_SCHEMA_NS_URI );
        final Schema schema = factory.newSchema( getClass().getResource( "/META-INF/xsd/model.xsd" ) );

        final Validator validator = schema.newValidator();
        validator.setErrorHandler( new ErrorHandler()
        {
            @Override
            public void warning( final SAXParseException exception )
                throws SAXException
            {
                // Do nothing
            }

            @Override
            public void error( final SAXParseException exception )
                throws SAXException
            {
                throw new AssertionError( exception );
            }

            @Override
            public void fatalError( final SAXParseException exception )
                throws SAXException
            {
                throw new AssertionError( exception );
            }
        } );

        final Document doc = DomHelper.parse( new FileReader( file ) );
        if ( SchemaNamespaces.MODEL_NS.equals( doc.getDocumentElement().getNamespaceURI() ) )
        {
            validator.validate( new DOMSource( doc ) );
        }
    }
}
