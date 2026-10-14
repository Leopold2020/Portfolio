SELECT members."Fornamn", members."Efternamn", members."Roller", members."Grupper", education."Utbildning", education."Utbildning2"
FROM (members INNER JOIN education 
ON members."Fornamn" = education."Fornamn" AND members."Efternamn" = education."Efternamn")
WHERE members."Grupper" LIKE '%P13:6%'


SELECT members."Fornamn", members."Efternamn", members."Roller", members."Grupper", education."Utbildning", education."Utbildning2"
FROM (members FULL JOIN education 
ON members."Fornamn" = education."Fornamn" AND members."Efternamn" = education."Efternamn")
WHERE members."Grupper" LIKE '%P13:6%'

SELECT members."Fornamn", members."Efternamn", members."Roller", members."Grupper", education."Utbildning"

SELECT "Fornamn", string_agg("Utbildning", ', ') AS "Utbildning"
FROM education
GROUP BY "Fornamn" LIMIT 10; 

SELECT members."Fornamn", members."Efternamn", members."Roller", string_agg(education."Utbildning", ', ')
FROM (members LEFT JOIN education
ON members."Fornamn" = education."Fornamn" AND members."Efternamn" = education."Efternamn")
WHERE members."Grupper" LIKE '%P13:6%';

