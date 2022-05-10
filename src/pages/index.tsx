import { GetStaticProps } from 'next';
import Header from '../components/Header';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import  Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
    const formmattedPost = postsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
     }
    });

    const [posts, setPosts] = useState<Post[]>(formmattedPost);
    const [nextPage, setNextPage] = useState(postsPagination.next_page);
    const [currentPage, setCurrentPage] = useState(1);
    console.log(currentPage);
    

    async function handleNextPage(): Promise<void> {
      if (currentPage !== 1 && nextPage === null) {
        return;
      }

      const postResults = await fetch(`${nextPage}`)
      .then(response => response.json());

      console.log(postResults);

      setNextPage(postResults.next_page)
    }

    
    return(
      <>
      <Head>
        <title> Home | spacetraveling </title>  
      </Head>
      <main className={commonStyles.container}>
      <Header />
            <section className={styles.posts}>
              {posts.map(post => (
                <Link href={`/post/${post.uid}`} key={post.uid}>
                  <a href="#" className={styles.post}>
                    <strong>{post.data.title}</strong>
                    <p>
                      {post.data.subtitle}
                    </p>
                    <ul>
                      <li>
                        <FiCalendar />
                        {post.first_publication_date}
                      </li>
                      <li>
                        <FiUser />
                        {post.data.author}
                      </li>
                    </ul>
                  </a>
                </Link>
              ))              
              }
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
            </section>
        </main>
      </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType("posts", {
    pageSize: 1,
  });

  const posts= postsResponse.results.map(post =>{
    return {
      uid: post.uid,
      data:{
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    }
  });

  const postsPagination ={
    next_page: postsResponse.next_page,
    results: posts,
  }

  console.log(JSON.stringify(postsPagination, null, 2));
  
  return {
    props: { postsPagination }
  }
};
