module my_address::MySpaceB {

    use std::string::{Self, String};
    use std::signer;
    use aptos_std::table::{Self, Table};

    struct Articles has key {
        articles: Table<ArticleId, Article>
    }

    struct ArticleId has key, copy, drop {
        title: String
    }

    struct Article has store, copy {
        title: string::String,
        content: string::String,
    }
    
    public entry fun add_article(from: &signer, title: string::String, content: string::String) acquires Articles {
        initialize_articles(from);
        let articles = &mut borrow_global_mut<Articles>(signer::address_of(from)).articles;
        table::add(articles, ArticleId {title}, Article { title, content});
    }

    public fun initialize_articles(account: &signer) {
        if (!exists<Articles>(signer::address_of(account))) {
            move_to(account, Articles {
                articles: table::new(),
            });
        }
    }

    public fun fetch_article(account: address, name: String): Article acquires Articles {
        let articles = &borrow_global<Articles>(account).articles;
        let id = ArticleId {
            title: name,
        };
        *table::borrow(articles, id)
    }

    #[test(account = @0x1)]
    public entry fun test_add_article(account: &signer) acquires Articles {
        let title = string::utf8(b"1212");
        let content = string::utf8(b"asadsfaasdfasdfadsfadsfadsfdsf");
        add_article(account, title, content);
        let articles = &borrow_global<Articles>(signer::address_of(account)).articles;
        let res = table::contains(articles, ArticleId {title});
        assert!(res, 0);
    }
}