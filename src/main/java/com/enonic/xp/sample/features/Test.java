package com.enonic.xp.sample.features;

public class Test
{
    public String callme() throws Exception {
        final ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

        try
        {
            Thread.currentThread().setContextClassLoader( ClassLoader.getSystemClassLoader() );
            return new javax.script.ScriptEngineManager().getEngineByName( "Graal.js" ).eval( "`Hello Graal.js`" ).toString();
        }
        finally
        {
            Thread.currentThread().setContextClassLoader( classLoader );
        }
    }

    public static void main( String[] args ) throws Exception
    {
        System.out.println(new Test().callme());
    }
}
