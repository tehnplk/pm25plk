--
-- PostgreSQL database dump
--

\restrict GlgSy4XDbfUiQJ8OHaNcuQySnuJ9V6cPitaD7VBCTQDbTXz4D7h0XyitgGPFrCe

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gistda_import_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gistda_import_runs (
    id bigint NOT NULL,
    source_name text DEFAULT 'GISTDA'::text NOT NULL,
    province_id integer NOT NULL,
    province_name_th text NOT NULL,
    province_name_en text,
    source_updated_at timestamp with time zone NOT NULL,
    imported_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: gistda_import_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gistda_import_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gistda_import_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gistda_import_runs_id_seq OWNED BY public.gistda_import_runs.id;


--
-- Name: gistda_pm25_district_hourly; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gistda_pm25_district_hourly (
    id bigint NOT NULL,
    import_run_id bigint NOT NULL,
    province_id integer NOT NULL,
    district_id integer NOT NULL,
    district_name_th text NOT NULL,
    district_name_en text,
    pm25 numeric(8,2) NOT NULL,
    pm25_avg_24hr numeric(8,2) NOT NULL,
    aqi integer NOT NULL,
    risk_status character varying(16) NOT NULL,
    affected_population integer,
    patients integer,
    source_updated_at timestamp with time zone NOT NULL,
    imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gistda_pm25_district_hourly_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gistda_pm25_district_hourly_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gistda_pm25_district_hourly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gistda_pm25_district_hourly_id_seq OWNED BY public.gistda_pm25_district_hourly.id;


--
-- Name: gistda_pm25_district_latest; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.gistda_pm25_district_latest AS
 SELECT DISTINCT ON (district_id) province_id,
    district_id,
    district_name_th,
    district_name_en,
    pm25,
    pm25_avg_24hr,
    aqi,
    risk_status,
    affected_population,
    patients,
    source_updated_at,
    imported_at
   FROM public.gistda_pm25_district_hourly
  ORDER BY district_id, source_updated_at DESC;


--
-- Name: gistda_pm25_province_hourly; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gistda_pm25_province_hourly (
    id bigint NOT NULL,
    import_run_id bigint NOT NULL,
    province_id integer NOT NULL,
    province_name_th text NOT NULL,
    province_name_en text,
    pm25 numeric(8,2) NOT NULL,
    pm25_avg_24hr numeric(8,2) NOT NULL,
    aqi integer NOT NULL,
    source_updated_at timestamp with time zone NOT NULL,
    imported_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gistda_pm25_province_hourly_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gistda_pm25_province_hourly_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gistda_pm25_province_hourly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gistda_pm25_province_hourly_id_seq OWNED BY public.gistda_pm25_province_hourly.id;


--
-- Name: gistda_pm25_province_latest; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.gistda_pm25_province_latest AS
 SELECT DISTINCT ON (province_id) province_id,
    province_name_th,
    province_name_en,
    pm25,
    pm25_avg_24hr,
    aqi,
    source_updated_at,
    imported_at
   FROM public.gistda_pm25_province_hourly
  ORDER BY province_id, source_updated_at DESC;


--
-- Name: medical_public_health_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_public_health_daily (
    report_date date NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    district_name text DEFAULT 'เมืองพิษณุโลก'::text NOT NULL
);


--
-- Name: gistda_import_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_import_runs ALTER COLUMN id SET DEFAULT nextval('public.gistda_import_runs_id_seq'::regclass);


--
-- Name: gistda_pm25_district_hourly id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_district_hourly ALTER COLUMN id SET DEFAULT nextval('public.gistda_pm25_district_hourly_id_seq'::regclass);


--
-- Name: gistda_pm25_province_hourly id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_province_hourly ALTER COLUMN id SET DEFAULT nextval('public.gistda_pm25_province_hourly_id_seq'::regclass);


--
-- Data for Name: gistda_import_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gistda_import_runs (id, source_name, province_id, province_name_th, province_name_en, source_updated_at, imported_at, notes) FROM stdin;
1	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00	Triggered from scripts/gistda-hourly-worker.mjs
3	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00	Triggered from scripts/gistda-hourly-worker.mjs
4	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00	Triggered from scripts/gistda-hourly-worker.mjs
5	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00	Triggered from scripts/gistda-hourly-worker.mjs
6	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00	Triggered from scripts/gistda-hourly-worker.mjs
7	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00	Triggered from scripts/gistda-hourly-worker.mjs
8	GISTDA	65	พิษณุโลก	Phitsanu Lok	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00	Triggered from scripts/gistda-hourly-worker.mjs
\.


--
-- Data for Name: gistda_pm25_district_hourly; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gistda_pm25_district_hourly (id, import_run_id, province_id, district_id, district_name_th, district_name_en, pm25, pm25_avg_24hr, aqi, risk_status, affected_population, patients, source_updated_at, imported_at) FROM stdin;
1	1	65	6503	ชาติตระการ	Chattakan	73.65	74.93	161	Red	30000	80	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
2	1	65	6502	นครไทย	Nakhon Thai	63.79	66.73	157	Red	45000	120	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
3	1	65	6507	วัดโบสถ์	Wat Bot	61.59	72.88	160	Red	32000	95	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
4	1	65	6506	พรหมพิราม	Phom Phiram	58.34	74.92	161	Red	65000	200	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
5	1	65	6509	เนินมะปราง	Noen Mapang	51.01	59.50	153	Red	28000	60	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
6	1	65	6508	วังทอง	Wang Thong	50.85	66.08	156	Red	95000	380	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
7	1	65	6504	บางระกำ	Bang Rakam	50.78	70.83	159	Red	85000	310	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
8	1	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	43.23	74.16	161	Red	125000	450	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
9	1	65	6505	บางกระทุ่ม	Bang Krathum	42.02	66.21	157	Red	42000	150	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
19	3	65	6503	ชาติตระการ	Chattakan	73.06	74.86	161	Red	30000	80	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
20	3	65	6502	นครไทย	Nakhon Thai	63.06	66.52	157	Red	45000	120	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
21	3	65	6507	วัดโบสถ์	Wat Bot	58.15	72.75	160	Red	32000	95	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
22	3	65	6506	พรหมพิราม	Phom Phiram	52.52	74.70	161	Red	65000	200	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
23	3	65	6509	เนินมะปราง	Noen Mapang	48.96	59.27	153	Red	28000	60	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
24	3	65	6508	วังทอง	Wang Thong	46.48	65.80	156	Red	95000	380	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
25	3	65	6504	บางระกำ	Bang Rakam	43.92	70.54	159	Red	85000	310	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
26	3	65	6505	บางกระทุ่ม	Bang Krathum	34.41	65.72	156	Red	42000	150	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
27	3	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	33.93	73.70	160	Red	125000	450	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
28	4	65	6503	ชาติตระการ	Chattakan	73.98	74.59	161	Red	30000	80	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
29	4	65	6502	นครไทย	Nakhon Thai	64.81	66.33	157	Red	45000	120	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
30	4	65	6507	วัดโบสถ์	Wat Bot	60.10	72.31	160	Red	32000	95	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
31	4	65	6506	พรหมพิราม	Phom Phiram	55.25	73.98	161	Red	65000	200	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
32	4	65	6508	วังทอง	Wang Thong	51.49	65.49	156	Red	95000	380	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
33	4	65	6509	เนินมะปราง	Noen Mapang	50.14	58.88	153	Red	28000	60	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
34	4	65	6504	บางระกำ	Bang Rakam	47.21	69.76	158	Red	85000	310	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
35	4	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	44.36	73.25	160	Red	125000	450	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
36	4	65	6505	บางกระทุ่ม	Bang Krathum	38.44	64.97	156	Red	42000	150	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
37	5	65	6503	ชาติตระการ	Chattakan	73.26	74.58	161	Red	30000	80	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
38	5	65	6507	วัดโบสถ์	Wat Bot	65.15	72.30	160	Red	32000	95	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
39	5	65	6502	นครไทย	Nakhon Thai	63.77	66.26	157	Red	45000	120	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
40	5	65	6506	พรหมพิราม	Phom Phiram	62.19	73.72	160	Red	65000	200	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
41	5	65	6508	วังทอง	Wang Thong	54.46	65.43	156	Red	95000	380	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
42	5	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	53.58	73.25	160	Red	125000	450	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
43	5	65	6504	บางระกำ	Bang Rakam	53.49	69.44	158	Red	85000	310	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
44	5	65	6509	เนินมะปราง	Noen Mapang	49.91	58.62	153	Red	28000	60	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
45	5	65	6505	บางกระทุ่ม	Bang Krathum	42.48	64.47	156	Red	42000	150	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
46	6	65	6503	ชาติตระการ	Chattakan	75.38	74.89	161	Red	30000	80	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
47	6	65	6507	วัดโบสถ์	Wat Bot	69.24	72.75	160	Red	32000	95	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
48	6	65	6506	พรหมพิราม	Phom Phiram	68.14	74.00	161	Red	65000	200	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
49	6	65	6502	นครไทย	Nakhon Thai	66.01	66.42	157	Red	45000	120	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
50	6	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	63.80	73.80	160	Red	125000	450	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
51	6	65	6504	บางระกำ	Bang Rakam	60.07	69.60	158	Red	85000	310	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
52	6	65	6508	วังทอง	Wang Thong	59.69	65.72	156	Red	95000	380	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
53	6	65	6509	เนินมะปราง	Noen Mapang	53.45	58.61	153	Red	28000	60	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
54	6	65	6505	บางกระทุ่ม	Bang Krathum	48.18	64.38	156	Red	42000	150	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
55	7	65	6503	ชาติตระการ	Chattakan	69.53	74.70	161	Red	30000	80	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
56	7	65	6507	วัดโบสถ์	Wat Bot	63.62	72.45	160	Red	32000	95	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
57	7	65	6506	พรหมพิราม	Phom Phiram	63.22	73.70	160	Red	65000	200	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
58	7	65	6502	นครไทย	Nakhon Thai	61.85	66.26	157	Red	45000	120	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
59	7	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	59.93	73.22	160	Red	125000	450	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
60	7	65	6504	บางระกำ	Bang Rakam	57.46	69.28	158	Red	85000	310	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
61	7	65	6508	วังทอง	Wang Thong	56.76	65.43	156	Red	95000	380	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
62	7	65	6509	เนินมะปราง	Noen Mapang	51.97	58.49	153	Red	28000	60	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
63	7	65	6505	บางกระทุ่ม	Bang Krathum	50.11	64.19	155	Red	42000	150	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
64	8	65	6503	ชาติตระการ	Chattakan	63.38	74.40	161	Red	30000	80	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
65	8	65	6506	พรหมพิราม	Phom Phiram	60.93	73.34	160	Red	65000	200	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
66	8	65	6507	วัดโบสถ์	Wat Bot	60.86	72.10	160	Red	32000	95	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
67	8	65	6501	เมืองพิษณุโลก	Mueang Phitsanu Lok	58.35	72.61	160	Red	125000	450	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
68	8	65	6502	นครไทย	Nakhon Thai	56.49	66.01	156	Red	45000	120	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
69	8	65	6504	บางระกำ	Bang Rakam	56.45	68.97	158	Red	85000	310	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
70	8	65	6508	วังทอง	Wang Thong	54.64	65.14	156	Red	95000	380	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
71	8	65	6505	บางกระทุ่ม	Bang Krathum	53.81	64.25	156	Red	42000	150	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
72	8	65	6509	เนินมะปราง	Noen Mapang	50.36	58.40	152	Red	28000	60	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
\.


--
-- Data for Name: gistda_pm25_province_hourly; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gistda_pm25_province_hourly (id, import_run_id, province_id, province_name_th, province_name_en, pm25, pm25_avg_24hr, aqi, source_updated_at, imported_at) FROM stdin;
1	1	65	พิษณุโลก	Phitsanu Lok	57.98	69.16	158	2026-04-02 09:00:00+00	2026-04-02 02:34:44.06483+00
3	3	65	พิษณุโลก	Phitsanu Lok	54.54	68.93	158	2026-04-02 10:00:00+00	2026-04-02 03:34:45.783636+00
4	4	65	พิษณุโลก	Phitsanu Lok	57.53	68.54	158	2026-04-02 11:00:00+00	2026-04-02 04:34:47.96506+00
5	5	65	พิษณุโลก	Phitsanu Lok	59.94	68.42	158	2026-04-02 12:00:00+00	2026-04-02 05:34:49.021067+00
6	6	65	พิษณุโลก	Phitsanu Lok	64.28	68.65	158	2026-04-02 13:00:00+00	2026-04-02 06:34:50.666726+00
7	7	65	พิษณุโลก	Phitsanu Lok	60.52	68.41	158	2026-04-02 14:00:00+00	2026-04-02 07:34:51.922154+00
8	8	65	พิษณุโลก	Phitsanu Lok	57.37	68.12	158	2026-04-02 15:00:00+00	2026-04-02 08:34:53.105854+00
\.


--
-- Data for Name: medical_public_health_daily; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_public_health_daily (report_date, payload, created_at, updated_at, district_name) FROM stdin;
2026-04-01	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "100", "n95Cumulative": "350", "surgicalDaily": "250", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "inventorySuppliesForm": {"n95Distributed": "0", "maskDistributed": "0"}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "4732"}, "children": {"dailyServed": "594"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "2385"}}}	2026-04-02 08:56:08.484279+00	2026-04-02 08:56:08.484279+00	นครไทย
2026-04-02	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "100", "n95Cumulative": "350", "surgicalDaily": "250", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "4732"}, "children": {"dailyServed": "594"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "2385"}}}	2026-04-02 07:22:09.818598+00	2026-04-02 07:58:01.08991+00	เมืองพิษณุโลก
2026-04-02	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "100", "n95Cumulative": "350", "surgicalDaily": "250", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "4732"}, "children": {"dailyServed": "594"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "2385"}}}	2026-04-02 08:01:21.172333+00	2026-04-02 08:01:21.172333+00	วัดโบสถ์
2026-04-02	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "100", "n95Cumulative": "350", "surgicalDaily": "250", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "4732"}, "children": {"dailyServed": "594"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "2385"}}}	2026-04-02 08:07:29.17619+00	2026-04-02 08:07:29.17619+00	บางระกำ
2026-04-02	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "999", "generalPublicForm": {"n95Daily": "222", "n95Cumulative": "350", "surgicalDaily": "333", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "vulnerableServiceForm": {"heart": {"dailyServed": "4"}, "elderly": {"dailyServed": "3"}, "children": {"dailyServed": "1"}, "pregnant": {"dailyServed": "2"}, "respiratory": {"dailyServed": "5"}}}	2026-04-02 07:50:04.351603+00	2026-04-02 07:50:04.351603+00	วังทอง
2026-04-03	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "0"}, "community": {"standardRooms": "0"}, "subdistrict": {"standardRooms": "0"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "0", "n95Cumulative": "350", "surgicalDaily": "0", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "inventorySuppliesForm": {"n95Distributed": "5", "maskDistributed": "10"}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "0"}, "children": {"dailyServed": "0"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "0"}}}	2026-04-03 02:37:58.251572+00	2026-04-03 02:37:58.251572+00	นครไทย
2026-04-03	{"cleanRoomForm": {"general": {"standardRooms": "0"}, "advanced": {"standardRooms": "1"}, "community": {"standardRooms": "8"}, "subdistrict": {"standardRooms": "107"}}, "cleanRoomVisitors": "750", "generalPublicForm": {"n95Daily": "100", "n95Cumulative": "350", "surgicalDaily": "250", "surgicalCumulative": "20,420"}, "targetedGroupForm": {"heart": {"n95Daily": "0", "surgicalDaily": "0"}, "elderly": {"n95Daily": "0", "surgicalDaily": "250"}, "children": {"n95Daily": "0", "surgicalDaily": "0"}, "pregnant": {"n95Daily": "0", "surgicalDaily": "0"}, "respiratory": {"n95Daily": "0", "surgicalDaily": "0"}}, "inventorySuppliesForm": {"n95Distributed": "99", "maskDistributed": "888"}, "vulnerableServiceForm": {"heart": {"dailyServed": "0"}, "elderly": {"dailyServed": "4732"}, "children": {"dailyServed": "594"}, "pregnant": {"dailyServed": "0"}, "respiratory": {"dailyServed": "2385"}}}	2026-04-03 02:36:36.841012+00	2026-04-03 02:36:36.841012+00	ชาติตระการ
\.


--
-- Name: gistda_import_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gistda_import_runs_id_seq', 8, true);


--
-- Name: gistda_pm25_district_hourly_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gistda_pm25_district_hourly_id_seq', 72, true);


--
-- Name: gistda_pm25_province_hourly_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gistda_pm25_province_hourly_id_seq', 8, true);


--
-- Name: gistda_import_runs gistda_import_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_import_runs
    ADD CONSTRAINT gistda_import_runs_pkey PRIMARY KEY (id);


--
-- Name: gistda_pm25_district_hourly gistda_pm25_district_hourly_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_district_hourly
    ADD CONSTRAINT gistda_pm25_district_hourly_pkey PRIMARY KEY (id);


--
-- Name: gistda_pm25_province_hourly gistda_pm25_province_hourly_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_province_hourly
    ADD CONSTRAINT gistda_pm25_province_hourly_pkey PRIMARY KEY (id);


--
-- Name: medical_public_health_daily medical_public_health_daily_report_date_district_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_public_health_daily
    ADD CONSTRAINT medical_public_health_daily_report_date_district_key PRIMARY KEY (report_date, district_name);


--
-- Name: gistda_import_runs_source_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gistda_import_runs_source_updated_at_idx ON public.gistda_import_runs USING btree (source_name, province_id, source_updated_at);


--
-- Name: gistda_pm25_district_hourly_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gistda_pm25_district_hourly_lookup_idx ON public.gistda_pm25_district_hourly USING btree (province_id, source_updated_at DESC);


--
-- Name: gistda_pm25_district_hourly_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gistda_pm25_district_hourly_unique_idx ON public.gistda_pm25_district_hourly USING btree (district_id, source_updated_at);


--
-- Name: gistda_pm25_province_hourly_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gistda_pm25_province_hourly_unique_idx ON public.gistda_pm25_province_hourly USING btree (province_id, source_updated_at);


--
-- Name: gistda_pm25_district_hourly gistda_pm25_district_hourly_import_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_district_hourly
    ADD CONSTRAINT gistda_pm25_district_hourly_import_run_id_fkey FOREIGN KEY (import_run_id) REFERENCES public.gistda_import_runs(id) ON DELETE CASCADE;


--
-- Name: gistda_pm25_province_hourly gistda_pm25_province_hourly_import_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gistda_pm25_province_hourly
    ADD CONSTRAINT gistda_pm25_province_hourly_import_run_id_fkey FOREIGN KEY (import_run_id) REFERENCES public.gistda_import_runs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GlgSy4XDbfUiQJ8OHaNcuQySnuJ9V6cPitaD7VBCTQDbTXz4D7h0XyitgGPFrCe

