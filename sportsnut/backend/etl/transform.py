from csv import reader, writer


w = writer(open('stadiums2.csv','w'))
r = reader(open('stadiums.csv'))
r.next()
w.writerow(['stadium', 'lat', 'lon'])
for i in r:
    lon, lat = i[2].split(',')
    w.writerow([i[0], lat, lon, None])

w = writer(open('matches2.csv','w'))
r = reader(open('matches.csv'))
r.next()
w.writerow(['time','team1','team2','stadium','timezone','identifier'])
for i in r:
    t1, t2 = [ s.strip() for s in i[3].split(' - ',2) ]
    print "'%s'" % t1
    print "'%s'" %t2
    w.writerow([i[2], t1, t2, i[4], i[5], i[6]])

#psql -d sportsnut -U postgres -W -h localhost -c 'COPY teams FROM STDIN WITH CSV HEADER' < teams.csv
