"""
List of 20 common North American backyard bird species to collect
"""

SPECIES_LIST = [
    {
        "id": "northern-cardinal",
        "commonName": "Northern Cardinal",
        "scientificName": "Cardinalis cardinalis",
        "genus": "Cardinalis",
        "species": "cardinalis"
    },
    {
        "id": "american-robin",
        "commonName": "American Robin",
        "scientificName": "Turdus migratorius",
        "genus": "Turdus",
        "species": "migratorius"
    },
    {
        "id": "blue-jay",
        "commonName": "Blue Jay",
        "scientificName": "Cyanocitta cristata",
        "genus": "Cyanocitta",
        "species": "cristata"
    },
    {
        "id": "black-capped-chickadee",
        "commonName": "Black-capped Chickadee",
        "scientificName": "Poecile atricapillus",
        "genus": "Poecile",
        "species": "atricapillus"
    },
    {
        "id": "american-crow",
        "commonName": "American Crow",
        "scientificName": "Corvus brachyrhynchos",
        "genus": "Corvus",
        "species": "brachyrhynchos"
    },
    {
        "id": "mourning-dove",
        "commonName": "Mourning Dove",
        "scientificName": "Zenaida macroura",
        "genus": "Zenaida",
        "species": "macroura"
    },
    {
        "id": "red-winged-blackbird",
        "commonName": "Red-winged Blackbird",
        "scientificName": "Agelaius phoeniceus",
        "genus": "Agelaius",
        "species": "phoeniceus"
    },
    {
        "id": "northern-mockingbird",
        "commonName": "Northern Mockingbird",
        "scientificName": "Mimus polyglottos",
        "genus": "Mimus",
        "species": "polyglottos"
    },
    {
        "id": "american-goldfinch",
        "commonName": "American Goldfinch",
        "scientificName": "Spinus tristis",
        "genus": "Spinus",
        "species": "tristis"
    },
    {
        "id": "house-sparrow",
        "commonName": "House Sparrow",
        "scientificName": "Passer domesticus",
        "genus": "Passer",
        "species": "domesticus"
    },
    {
        "id": "song-sparrow",
        "commonName": "Song Sparrow",
        "scientificName": "Melospiza melodia",
        "genus": "Melospiza",
        "species": "melodia"
    },
    {
        "id": "downy-woodpecker",
        "commonName": "Downy Woodpecker",
        "scientificName": "Dryobates pubescens",
        "genus": "Dryobates",
        "species": "pubescens"
    },
    {
        "id": "eastern-bluebird",
        "commonName": "Eastern Bluebird",
        "scientificName": "Sialia sialis",
        "genus": "Sialia",
        "species": "sialis"
    },
    {
        "id": "house-finch",
        "commonName": "House Finch",
        "scientificName": "Haemorhous mexicanus",
        "genus": "Haemorhous",
        "species": "mexicanus"
    },
    {
        "id": "tufted-titmouse",
        "commonName": "Tufted Titmouse",
        "scientificName": "Baeolophus bicolor",
        "genus": "Baeolophus",
        "species": "bicolor"
    },
    {
        "id": "white-breasted-nuthatch",
        "commonName": "White-breasted Nuthatch",
        "scientificName": "Sitta carolinensis",
        "genus": "Sitta",
        "species": "carolinensis"
    },
    {
        "id": "carolina-wren",
        "commonName": "Carolina Wren",
        "scientificName": "Thryothorus ludovicianus",
        "genus": "Thryothorus",
        "species": "ludovicianus"
    },
    {
        "id": "common-grackle",
        "commonName": "Common Grackle",
        "scientificName": "Quiscalus quiscula",
        "genus": "Quiscalus",
        "species": "quiscula"
    },
    {
        "id": "cedar-waxwing",
        "commonName": "Cedar Waxwing",
        "scientificName": "Bombycilla cedrorum",
        "genus": "Bombycilla",
        "species": "cedrorum"
    },
    {
        "id": "baltimore-oriole",
        "commonName": "Baltimore Oriole",
        "scientificName": "Icterus galbula",
        "genus": "Icterus",
        "species": "galbula"
    },
    # Core widespread species (all 3 regions)
    {
        "id": "dark-eyed-junco",
        "commonName": "Dark-eyed Junco",
        "scientificName": "Junco hyemalis",
        "genus": "Junco",
        "species": "hyemalis"
    },
    {
        "id": "chipping-sparrow",
        "commonName": "Chipping Sparrow",
        "scientificName": "Spizella passerina",
        "genus": "Spizella",
        "species": "passerina"
    },
    {
        "id": "european-starling",
        "commonName": "European Starling",
        "scientificName": "Sturnus vulgaris",
        "genus": "Sturnus",
        "species": "vulgaris"
    },
    {
        "id": "killdeer",
        "commonName": "Killdeer",
        "scientificName": "Charadrius vociferus",
        "genus": "Charadrius",
        "species": "vociferus"
    },
    {
        "id": "rock-pigeon",
        "commonName": "Rock Pigeon",
        "scientificName": "Columba livia",
        "genus": "Columba",
        "species": "livia"
    },
    {
        "id": "common-raven",
        "commonName": "Common Raven",
        "scientificName": "Corvus corax",
        "genus": "Corvus",
        "species": "corax"
    },
    {
        "id": "brown-headed-cowbird",
        "commonName": "Brown-headed Cowbird",
        "scientificName": "Molothrus ater",
        "genus": "Molothrus",
        "species": "ater"
    },
    {
        "id": "american-kestrel",
        "commonName": "American Kestrel",
        "scientificName": "Falco sparverius",
        "genus": "Falco",
        "species": "sparverius"
    },
    {
        "id": "red-tailed-hawk",
        "commonName": "Red-tailed Hawk",
        "scientificName": "Buteo jamaicensis",
        "genus": "Buteo",
        "species": "jamaicensis"
    },
    {
        "id": "great-blue-heron",
        "commonName": "Great Blue Heron",
        "scientificName": "Ardea herodias",
        "genus": "Ardea",
        "species": "herodias"
    },
    {
        "id": "mallard",
        "commonName": "Mallard",
        "scientificName": "Anas platyrhynchos",
        "genus": "Anas",
        "species": "platyrhynchos"
    },
    {
        "id": "canada-goose",
        "commonName": "Canada Goose",
        "scientificName": "Branta canadensis",
        "genus": "Branta",
        "species": "canadensis"
    },
    {
        "id": "ring-billed-gull",
        "commonName": "Ring-billed Gull",
        "scientificName": "Larus delawarensis",
        "genus": "Larus",
        "species": "delawarensis"
    },
    {
        "id": "tree-swallow",
        "commonName": "Tree Swallow",
        "scientificName": "Tachycineta bicolor",
        "genus": "Tachycineta",
        "species": "bicolor"
    },
    {
        "id": "barn-swallow",
        "commonName": "Barn Swallow",
        "scientificName": "Hirundo rustica",
        "genus": "Hirundo",
        "species": "rustica"
    },
    {
        "id": "ruby-crowned-kinglet",
        "commonName": "Ruby-crowned Kinglet",
        "scientificName": "Regulus calendula",
        "genus": "Regulus",
        "species": "calendula"
    },
    {
        "id": "yellow-rumped-warbler",
        "commonName": "Yellow-rumped Warbler",
        "scientificName": "Setophaga coronata",
        "genus": "Setophaga",
        "species": "coronata"
    },
    # Missouri specialists
    {
        "id": "indigo-bunting",
        "commonName": "Indigo Bunting",
        "scientificName": "Passerina cyanea",
        "genus": "Passerina",
        "species": "cyanea"
    },
    {
        "id": "dickcissel",
        "commonName": "Dickcissel",
        "scientificName": "Spiza americana",
        "genus": "Spiza",
        "species": "americana"
    },
    {
        "id": "field-sparrow",
        "commonName": "Field Sparrow",
        "scientificName": "Spizella pusilla",
        "genus": "Spizella",
        "species": "pusilla"
    },
    {
        "id": "eastern-towhee",
        "commonName": "Eastern Towhee",
        "scientificName": "Pipilo erythrophthalmus",
        "genus": "Pipilo",
        "species": "erythrophthalmus"
    },
    {
        "id": "brown-thrasher",
        "commonName": "Brown Thrasher",
        "scientificName": "Toxostoma rufum",
        "genus": "Toxostoma",
        "species": "rufum"
    },
    {
        "id": "red-headed-woodpecker",
        "commonName": "Red-headed Woodpecker",
        "scientificName": "Melanerpes erythrocephalus",
        "genus": "Melanerpes",
        "species": "erythrocephalus"
    },
    {
        "id": "eastern-phoebe",
        "commonName": "Eastern Phoebe",
        "scientificName": "Sayornis phoebe",
        "genus": "Sayornis",
        "species": "phoebe"
    },
    {
        "id": "eastern-kingbird",
        "commonName": "Eastern Kingbird",
        "scientificName": "Tyrannus tyrannus",
        "genus": "Tyrannus",
        "species": "tyrannus"
    },
    {
        "id": "orchard-oriole",
        "commonName": "Orchard Oriole",
        "scientificName": "Icterus spurius",
        "genus": "Icterus",
        "species": "spurius"
    },
    {
        "id": "blue-grosbeak",
        "commonName": "Blue Grosbeak",
        "scientificName": "Passerina caerulea",
        "genus": "Passerina",
        "species": "caerulea"
    },
    {
        "id": "wild-turkey",
        "commonName": "Wild Turkey",
        "scientificName": "Meleagris gallopavo",
        "genus": "Meleagris",
        "species": "gallopavo"
    },
    {
        "id": "great-crested-flycatcher",
        "commonName": "Great Crested Flycatcher",
        "scientificName": "Myiarchus crinitus",
        "genus": "Myiarchus",
        "species": "crinitus"
    },
    # West Coast specialists
    {
        "id": "stellers-jay",
        "commonName": "Steller's Jay",
        "scientificName": "Cyanocitta stelleri",
        "genus": "Cyanocitta",
        "species": "stelleri"
    },
    {
        "id": "california-scrub-jay",
        "commonName": "California Scrub-Jay",
        "scientificName": "Aphelocoma californica",
        "genus": "Aphelocoma",
        "species": "californica"
    },
    {
        "id": "california-towhee",
        "commonName": "California Towhee",
        "scientificName": "Melozone crissalis",
        "genus": "Melozone",
        "species": "crissalis"
    },
    {
        "id": "annas-hummingbird",
        "commonName": "Anna's Hummingbird",
        "scientificName": "Calypte anna",
        "genus": "Calypte",
        "species": "anna"
    },
    {
        "id": "black-phoebe",
        "commonName": "Black Phoebe",
        "scientificName": "Sayornis nigricans",
        "genus": "Sayornis",
        "species": "nigricans"
    },
    {
        "id": "western-bluebird",
        "commonName": "Western Bluebird",
        "scientificName": "Sialia mexicana",
        "genus": "Sialia",
        "species": "mexicana"
    },
    {
        "id": "spotted-towhee",
        "commonName": "Spotted Towhee",
        "scientificName": "Pipilo maculatus",
        "genus": "Pipilo",
        "species": "maculatus"
    },
    {
        "id": "bushtit",
        "commonName": "Bushtit",
        "scientificName": "Psaltriparus minimus",
        "genus": "Psaltriparus",
        "species": "minimus"
    },
    {
        "id": "bewicks-wren",
        "commonName": "Bewick's Wren",
        "scientificName": "Thryomanes bewickii",
        "genus": "Thryomanes",
        "species": "bewickii"
    },
    # New England specialists
    {
        "id": "common-loon",
        "commonName": "Common Loon",
        "scientificName": "Gavia immer",
        "genus": "Gavia",
        "species": "immer"
    },
    {
        "id": "hermit-thrush",
        "commonName": "Hermit Thrush",
        "scientificName": "Catharus guttatus",
        "genus": "Catharus",
        "species": "guttatus"
    },
    {
        "id": "purple-finch",
        "commonName": "Purple Finch",
        "scientificName": "Haemorhous purpureus",
        "genus": "Haemorhous",
        "species": "purpureus"
    },
    {
        "id": "pine-warbler",
        "commonName": "Pine Warbler",
        "scientificName": "Setophaga pinus",
        "genus": "Setophaga",
        "species": "pinus"
    },
    {
        "id": "pileated-woodpecker",
        "commonName": "Pileated Woodpecker",
        "scientificName": "Dryocopus pileatus",
        "genus": "Dryocopus",
        "species": "pileatus"
    },
    {
        "id": "wood-thrush",
        "commonName": "Wood Thrush",
        "scientificName": "Hylocichla mustelina",
        "genus": "Hylocichla",
        "species": "mustelina"
    },
    {
        "id": "veery",
        "commonName": "Veery",
        "scientificName": "Catharus fuscescens",
        "genus": "Catharus",
        "species": "fuscescens"
    },
    {
        "id": "yellow-bellied-sapsucker",
        "commonName": "Yellow-bellied Sapsucker",
        "scientificName": "Sphyrapicus varius",
        "genus": "Sphyrapicus",
        "species": "varius"
    },
    {
        "id": "black-throated-green-warbler",
        "commonName": "Black-throated Green Warbler",
        "scientificName": "Setophaga virens",
        "genus": "Setophaga",
        "species": "virens"
    },
    # Missouri + New England overlap
    {
        "id": "ruby-throated-hummingbird",
        "commonName": "Ruby-throated Hummingbird",
        "scientificName": "Archilochus colubris",
        "genus": "Archilochus",
        "species": "colubris"
    },
    {
        "id": "scarlet-tanager",
        "commonName": "Scarlet Tanager",
        "scientificName": "Piranga olivacea",
        "genus": "Piranga",
        "species": "olivacea"
    },
    {
        "id": "rose-breasted-grosbeak",
        "commonName": "Rose-breasted Grosbeak",
        "scientificName": "Pheucticus ludovicianus",
        "genus": "Pheucticus",
        "species": "ludovicianus"
    },
    {
        "id": "ovenbird",
        "commonName": "Ovenbird",
        "scientificName": "Seiurus aurocapilla",
        "genus": "Seiurus",
        "species": "aurocapilla"
    },
    {
        "id": "red-eyed-vireo",
        "commonName": "Red-eyed Vireo",
        "scientificName": "Vireo olivaceus",
        "genus": "Vireo",
        "species": "olivaceus"
    },
    # Missouri + West Coast overlap
    {
        "id": "western-kingbird",
        "commonName": "Western Kingbird",
        "scientificName": "Tyrannus verticalis",
        "genus": "Tyrannus",
        "species": "verticalis"
    },
    {
        "id": "western-meadowlark",
        "commonName": "Western Meadowlark",
        "scientificName": "Sturnella neglecta",
        "genus": "Sturnella",
        "species": "neglecta"
    },
    {
        "id": "bullocks-oriole",
        "commonName": "Bullock's Oriole",
        "scientificName": "Icterus bullockii",
        "genus": "Icterus",
        "species": "bullockii"
    },
    {
        "id": "says-phoebe",
        "commonName": "Say's Phoebe",
        "scientificName": "Sayornis saya",
        "genus": "Sayornis",
        "species": "saya"
    },
    {
        "id": "lazuli-bunting",
        "commonName": "Lazuli Bunting",
        "scientificName": "Passerina amoena",
        "genus": "Passerina",
        "species": "amoena"
    },
    # West Coast + New England overlap
    {
        "id": "red-breasted-nuthatch",
        "commonName": "Red-breasted Nuthatch",
        "scientificName": "Sitta canadensis",
        "genus": "Sitta",
        "species": "canadensis"
    },
    {
        "id": "golden-crowned-kinglet",
        "commonName": "Golden-crowned Kinglet",
        "scientificName": "Regulus satrapa",
        "genus": "Regulus",
        "species": "satrapa"
    },
    {
        "id": "winter-wren",
        "commonName": "Winter Wren",
        "scientificName": "Troglodytes hiemalis",
        "genus": "Troglodytes",
        "species": "hiemalis"
    },
    {
        "id": "fox-sparrow",
        "commonName": "Fox Sparrow",
        "scientificName": "Passerella iliaca",
        "genus": "Passerella",
        "species": "iliaca"
    },
    {
        "id": "varied-thrush",
        "commonName": "Varied Thrush",
        "scientificName": "Ixoreus naevius",
        "genus": "Ixoreus",
        "species": "naevius"
    }
]
