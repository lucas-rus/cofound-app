package com.cofound.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class RenderDatabaseConfig {

    @Bean
    public DataSource dataSource(Environment env) throws URISyntaxException {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        // 1. Render PostgreSQL (Automatic)
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            System.out.println("Configuring Render PostgreSQL Database...");
            URI dbUri = new URI(databaseUrl);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

            return DataSourceBuilder.create()
                    .url(dbUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        }

        // 2. Standard Properties (Manual)
        String manualUrl = env.getProperty("spring.datasource.url");
        if (manualUrl != null && !manualUrl.isEmpty()) {
            System.out.println("Configuring Standard PostgreSQL Database...");
            return DataSourceBuilder.create()
                    .url(manualUrl)
                    .username(env.getProperty("spring.datasource.username"))
                    .password(env.getProperty("spring.datasource.password"))
                    .build();
        }

        // 3. Fallback to H2 (Safety Net)
        System.err.println("WARNING: No Database Configuration Found! Using H2 In-Memory Database for temporary access.");
        return DataSourceBuilder.create()
                .url("jdbc:h2:mem:cofound_db;DB_CLOSE_DELAY=-1")
                .driverClassName("org.h2.Driver")
                .username("sa")
                .password("")
                .build();
    }
}
